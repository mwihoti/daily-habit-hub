/**
 * POST /api/web3/record-habit
 *
 * Validates a check-in and queues it for on-chain recording. The admin wallet
 * is a single EOA, so mints must be serialized — concurrent serverless
 * invocations would collide on the nonce. Jobs land in mint_queue and the
 * lease-guarded worker (/api/web3/process-mints) drains them; this route
 * kicks the worker fire-and-forget so tokens still arrive within seconds.
 *
 * When SUPABASE_SERVICE_ROLE_KEY is not configured the queue is unavailable
 * and the route falls back to the legacy inline mint.
 *
 * Required env vars (server-only — no NEXT_PUBLIC_ prefix):
 *   PRIVATE_ADMIN_KEY
 *   NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS
 *
 * Body: { targetWallet: string, habitType: string, metadataUri?: string }
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mintHabitOnChain } from '@/lib/web3/adminMinter'

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetWallet, habitType, metadataUri = '' } = await request.json()

    if (!targetWallet || !habitType) {
      return NextResponse.json({ error: 'targetWallet and habitType are required' }, { status: 400 })
    }

    // The wallet must be the one registered on the caller's own profile —
    // otherwise any signed-in user could mint to arbitrary addresses.
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', user.id)
      .single()

    if (!profile?.wallet_address || profile.wallet_address.toLowerCase() !== String(targetWallet).toLowerCase()) {
      return NextResponse.json({ error: 'Wallet does not match your profile' }, { status: 403 })
    }

    // Mint only against a real check-in: a workout logged today (UTC, matching
    // the contract's per-UTC-day rate limit).
    const utcDayStart = new Date()
    utcDayStart.setUTCHours(0, 0, 0, 0)
    const { count: todayWorkouts } = await supabase
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', utcDayStart.toISOString())

    if (!todayWorkouts) {
      return NextResponse.json({ error: 'No check-in recorded today' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // Legacy path: no service role key means no queue — mint inline.
    if (!adminClient) {
      const result = await mintHabitOnChain(targetWallet, habitType, metadataUri)
      if (result.skipped) return NextResponse.json({ skipped: true, reason: result.reason })
      return NextResponse.json({ success: true, txHash: result.txHash, blockNumber: result.blockNumber })
    }

    // Enqueue. The unique (user_id, queued_day) index is the per-user daily
    // limit — a duplicate insert means today's mint is already queued or done.
    const { error: queueError } = await adminClient.from('mint_queue').insert({
      user_id: user.id,
      wallet: targetWallet,
      habit_type: habitType,
      metadata_uri: metadataUri,
    })

    if (queueError) {
      if (queueError.code === '23505') {
        return NextResponse.json({ skipped: true, reason: 'Already recorded today' })
      }
      console.error('[record-habit] enqueue failed:', queueError.message)
      return NextResponse.json({ error: 'Could not queue on-chain recording' }, { status: 500 })
    }

    // Wake the worker without holding this request open. The daily sweeper
    // cron catches anything this kick misses.
    const workerUrl = new URL('/api/web3/process-mints', request.url)
    fetch(workerUrl, {
      method: 'POST',
      headers: process.env.PUSH_SEND_SECRET ? { 'x-push-secret': process.env.PUSH_SEND_SECRET } : {},
    }).catch(() => {})

    return NextResponse.json({ queued: true })
  } catch (err: any) {
    console.error('[record-habit]', err?.shortMessage ?? err?.message ?? err)
    return NextResponse.json({ error: err?.shortMessage ?? err?.message ?? 'Server error' }, { status: 500 })
  }
}
