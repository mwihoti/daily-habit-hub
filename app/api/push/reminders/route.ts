/**
 * GET /api/push/reminders
 *
 * Cron-driven reminder sender (see vercel.json crons — runs hourly).
 * Replaces the old browser-side polling: reminders now arrive even when
 * the app is closed, via the service worker.
 *
 * Sends two kinds of pushes:
 *   1. Task reminders — tasks whose reminder_at has passed in the last 24h
 *      and were not yet notified (deduped via tasks.reminder_sent_at).
 *   2. Streak-risk reminders — users who opted in, whose preferred hour
 *      (Nairobi time) is now and who have not checked in today (deduped via
 *      profiles.accountability_last_reminder_sent_at).
 *
 * Auth: Vercel cron's `Authorization: Bearer ${CRON_SECRET}` header, or
 * `x-push-secret: ${PUSH_SEND_SECRET}` for manual triggering.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { initVapid, sendToSubscriptions, PushSubscriptionRow } from '@/lib/push/webPush'
import { nairobiHour, isSameNairobiDay, nairobiDayStartUtc } from '@/lib/push/reminderWindows'
import { mapWithConcurrency } from '@/lib/push/concurrency'

export const maxDuration = 60

const TASK_BATCH_SIZE = 200
const SEND_CONCURRENCY = 10

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const pushSecret = request.headers.get('x-push-secret')
  const cronOk = !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
  const secretOk = !!process.env.PUSH_SEND_SECRET && pushSecret === process.env.PUSH_SEND_SECRET
  if (!cronOk && !secretOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }
  if (!initVapid()) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
  }

  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const deadline = Date.now() + 45_000 // headroom inside maxDuration
  let taskReminders = 0
  let taskPushes = 0
  let streakPushes = 0

  // ── 1. Task reminders — drain in batches until empty or out of time ───────
  while (Date.now() < deadline) {
    const { data: dueTasks } = await supabase
      .from('tasks')
      .select('id, user_id, title')
      .eq('is_completed', false)
      .is('reminder_sent_at', null)
      .lte('reminder_at', now.toISOString())
      .gt('reminder_at', dayAgo.toISOString())
      .limit(TASK_BATCH_SIZE)

    if (!dueTasks?.length) break
    taskReminders += dueTasks.length

    const userIds = [...new Set(dueTasks.map((t) => t.user_id))]
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth')
      .in('user_id', userIds)

    const subsByUser = new Map<string, PushSubscriptionRow[]>()
    for (const sub of subs ?? []) {
      const list = subsByUser.get(sub.user_id) ?? []
      list.push(sub)
      subsByUser.set(sub.user_id, list)
    }

    const sent = await mapWithConcurrency(dueTasks, SEND_CONCURRENCY, async (task) => {
      const userSubs = subsByUser.get(task.user_id)
      if (!userSubs?.length) return 0
      return sendToSubscriptions(supabase, userSubs, {
        title: `⏰ ${task.title}`,
        body: 'Your FitTribe task is due — knock it out!',
        url: '/tasks',
        tag: `task-${task.id}`,
      })
    })
    taskPushes += sent.reduce<number>((sum, n) => sum + (n ?? 0), 0)

    // Mark every scanned task as handled. Users without a push subscription
    // have no server-side channel, so re-scanning their tasks each run is
    // pointless — the reminder window is 24h either way.
    await supabase
      .from('tasks')
      .update({ reminder_sent_at: now.toISOString() })
      .in('id', dueTasks.map((t) => t.id))

    if (dueTasks.length < TASK_BATCH_SIZE) break
  }

  // ── 2. Streak-risk reminders ───────────────────────────────────────────────
  const { data: optedIn } = await supabase
    .from('profiles')
    .select('id, streak, accountability_reminder_hour, accountability_last_reminder_sent_at')
    .eq('accountability_reminder_enabled', true)

  const hourNow = nairobiHour(now)
  const candidates = (optedIn ?? []).filter((p) => {
    if ((p.accountability_reminder_hour ?? 19) !== hourNow) return false
    const last = p.accountability_last_reminder_sent_at
    return !last || !isSameNairobiDay(new Date(last), now)
  })

  if (candidates.length) {
    const candidateIds = candidates.map((p) => p.id)

    // Skip anyone who already checked in today (Nairobi day)
    const { data: todaysWorkouts } = await supabase
      .from('workouts')
      .select('user_id')
      .in('user_id', candidateIds)
      .gte('created_at', nairobiDayStartUtc(now).toISOString())
    const checkedIn = new Set((todaysWorkouts ?? []).map((w) => w.user_id))

    const toRemind = candidates.filter((p) => !checkedIn.has(p.id))
    if (toRemind.length) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('user_id, endpoint, p256dh, auth')
        .in('user_id', toRemind.map((p) => p.id))

      const subsByUser = new Map<string, PushSubscriptionRow[]>()
      for (const sub of subs ?? []) {
        const list = subsByUser.get(sub.user_id) ?? []
        list.push(sub)
        subsByUser.set(sub.user_id, list)
      }

      const outcomes = await mapWithConcurrency(toRemind, SEND_CONCURRENCY, async (p) => {
        const userSubs = subsByUser.get(p.id)
        if (!userSubs?.length) return null
        const sent = await sendToSubscriptions(supabase, userSubs, {
          title: p.streak > 0 ? `🔥 Your ${p.streak}-day streak is on the line` : '💪 Time to show up',
          body: p.streak > 0
            ? "One check-in keeps it alive. Don't break the chain!"
            : 'Log a workout today and start your streak.',
          url: '/check-in',
          tag: 'streak-reminder',
        })
        return sent > 0 ? { id: p.id, sent } : null
      })

      const remindedIds = outcomes.filter(Boolean).map((o) => o!.id)
      streakPushes += outcomes.reduce<number>((sum, o) => sum + (o?.sent ?? 0), 0)

      if (remindedIds.length) {
        await supabase
          .from('profiles')
          .update({ accountability_last_reminder_sent_at: now.toISOString() })
          .in('id', remindedIds)
      }
    }
  }

  return NextResponse.json({
    taskReminders,
    taskPushes,
    streakPushes,
  })
}
