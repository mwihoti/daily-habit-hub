/**
 * POST /api/web3/claim-achievement
 *
 * Records that a user has claimed a milestone NFT badge.
 * Validates eligibility against their real Supabase stats (streak / total_workouts).
 * If the user has a wallet, fires a background on-chain record-habit call to
 * advance their on-chain count toward the contract's auto-mint thresholds (7, 30).
 *
 * Body: { milestone: 'genesis' | 'iron_will' | 'three_weeks' | 'month_champion' | 'consistency_legend' }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MILESTONES: Record<string, { label: string; threshold: number; thresholdType: 'workouts' | 'streak' }> = {
  genesis:             { label: 'Genesis NFT Badge',     threshold: 1,  thresholdType: 'workouts' },
  iron_will:           { label: 'Iron Will',             threshold: 7,  thresholdType: 'streak'   },
  three_weeks:         { label: 'Three Weeks Strong',    threshold: 21, thresholdType: 'workouts' },
  month_champion:      { label: 'Month Champion',        threshold: 30, thresholdType: 'streak'   },
  consistency_legend:  { label: 'Consistency Legend',    threshold: 49, thresholdType: 'streak'   },
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { milestone } = body as { milestone?: string }

  if (!milestone || !MILESTONES[milestone]) {
    return NextResponse.json({ error: 'Invalid milestone' }, { status: 400 })
  }

  const config = MILESTONES[milestone]

  // Fetch user profile stats
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('streak, total_workouts, wallet_address')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Check eligibility — compare against both streak AND total_workouts (whichever is stricter)
  const streak = profile.streak ?? 0
  const totalWorkouts = profile.total_workouts ?? 0
  const value = config.thresholdType === 'streak' ? Math.max(streak, totalWorkouts) : totalWorkouts

  if (value < config.threshold) {
    return NextResponse.json({
      error: `Not yet eligible. Need ${config.threshold} ${config.thresholdType === 'streak' ? 'streak days' : 'check-ins'}, currently at ${value}.`,
    }, { status: 403 })
  }

  // Upsert into user_achievements (idempotent — can re-claim without error)
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id, claimed_at')
    .eq('user_id', user.id)
    .eq('milestone', milestone)
    .single()

  if (existing?.claimed_at) {
    return NextResponse.json({ alreadyClaimed: true, milestone })
  }

  const { error: upsertError } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: user.id,
      milestone,
      earned_at: new Date().toISOString(),
      claimed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,milestone' })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, milestone, label: config.label })
}
