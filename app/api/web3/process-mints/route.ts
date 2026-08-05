/**
 * POST|GET /api/web3/process-mints
 *
 * Drains the mint_queue serially so the single admin EOA never has two
 * transactions in flight (parallel mints collide on the nonce). Exactly one
 * worker runs at a time, enforced by an atomic lease claim on worker_leases —
 * extra invocations exit immediately with { busy: true }.
 *
 * Triggered fire-and-forget by /api/web3/record-habit after each enqueue,
 * and by a daily sweeper cron (vercel.json) that also retries failures.
 * If jobs remain when the time budget runs out, the worker re-kicks itself.
 *
 * Auth: Vercel cron's `Authorization: Bearer ${CRON_SECRET}` or
 * `x-push-secret: ${PUSH_SEND_SECRET}`. If neither secret is configured the
 * route stays open — it only processes the queue, which is idempotent.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mintHabitOnChain } from '@/lib/web3/adminMinter'

export const maxDuration = 60

const LEASE_NAME = 'mint-worker'
const LEASE_SECONDS = 90
const MAX_JOBS_PER_RUN = 12
const MAX_ATTEMPTS = 3

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  const pushSecret = process.env.PUSH_SEND_SECRET
  if (!cronSecret && !pushSecret) return true // bootstrap: no secrets configured yet
  if (cronSecret && request.headers.get('authorization') === `Bearer ${cronSecret}`) return true
  if (pushSecret && request.headers.get('x-push-secret') === pushSecret) return true
  return false
}

async function processQueue(request: Request, sweep: boolean) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }

  // Sweeper (daily cron): give recent failures a fresh set of attempts
  if (sweep) {
    await supabase
      .from('mint_queue')
      .update({ status: 'pending', attempts: 0 })
      .eq('status', 'failed')
      .gt('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
  }

  const renewLease = () =>
    supabase
      .from('worker_leases')
      .update({ locked_until: new Date(Date.now() + LEASE_SECONDS * 1000).toISOString() })
      .eq('name', LEASE_NAME)

  // Atomic claim: only succeeds if the previous lease has expired
  const { data: claimed } = await supabase
    .from('worker_leases')
    .update({ locked_until: new Date(Date.now() + LEASE_SECONDS * 1000).toISOString() })
    .eq('name', LEASE_NAME)
    .lt('locked_until', new Date().toISOString())
    .select('name')

  if (!claimed?.length) {
    return NextResponse.json({ busy: true })
  }

  let confirmed = 0
  let skipped = 0
  let failed = 0

  try {
    const deadline = Date.now() + 45_000 // leave headroom inside maxDuration

    for (let i = 0; i < MAX_JOBS_PER_RUN && Date.now() < deadline; i++) {
      const { data: jobs } = await supabase
        .from('mint_queue')
        .select('id, user_id, wallet, habit_type, metadata_uri, attempts')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)

      const job = jobs?.[0]
      if (!job) break

      await supabase
        .from('mint_queue')
        .update({ status: 'processing', attempts: job.attempts + 1 })
        .eq('id', job.id)
      await renewLease()

      try {
        const result = await mintHabitOnChain(job.wallet, job.habit_type, job.metadata_uri)

        if (result.skipped) {
          skipped++
          await supabase
            .from('mint_queue')
            .update({ status: 'confirmed', last_error: result.reason, processed_at: new Date().toISOString() })
            .eq('id', job.id)
        } else {
          confirmed++
          await supabase
            .from('mint_queue')
            .update({ status: 'confirmed', tx_hash: result.txHash, processed_at: new Date().toISOString() })
            .eq('id', job.id)
          await supabase.from('onchain_mint_log').insert({
            user_id: job.user_id,
            wallet: job.wallet,
            habit_type: job.habit_type,
            tx_hash: result.txHash,
          })
        }
      } catch (err: any) {
        const message = String(err?.shortMessage ?? err?.message ?? err).slice(0, 500)
        const exhausted = job.attempts + 1 >= MAX_ATTEMPTS
        if (exhausted) failed++
        await supabase
          .from('mint_queue')
          .update({
            status: exhausted ? 'failed' : 'pending',
            last_error: message,
            processed_at: new Date().toISOString(),
          })
          .eq('id', job.id)
        console.error(`[process-mints] job ${job.id} attempt ${job.attempts + 1}:`, message)
      }
    }

    // More work left? Chain another invocation instead of overstaying.
    const { count: remaining } = await supabase
      .from('mint_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (remaining) {
      const selfUrl = new URL(request.url)
      fetch(selfUrl, {
        method: 'POST',
        headers: process.env.PUSH_SEND_SECRET ? { 'x-push-secret': process.env.PUSH_SEND_SECRET } : {},
      }).catch(() => {})
    }

    return NextResponse.json({ confirmed, skipped, failed, remaining: remaining ?? 0 })
  } finally {
    await supabase
      .from('worker_leases')
      .update({ locked_until: new Date().toISOString() })
      .eq('name', LEASE_NAME)
  }
}

export async function POST(request: Request) {
  return processQueue(request, false)
}

export async function GET(request: Request) {
  return processQueue(request, true)
}
