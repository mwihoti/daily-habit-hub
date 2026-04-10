/**
 * POST /api/web3/claim-achievement
 *
 * Records that a user has claimed a milestone NFT badge.
 * Validates eligibility against real Supabase stats (streak / total_workouts).
 *
 * Body: { milestone: 'genesis' | 'iron_will' | 'three_weeks' | 'month_champion' | 'consistency_legend' }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface MilestoneConfig {
  label: string
  // Threshold for BOTH streak and workouts — check the right one per milestone
  streakThreshold?: number    // requires profile.streak >= this value
  workoutsThreshold?: number  // requires profile.total_workouts >= this value
}

const MILESTONES: Record<string, MilestoneConfig> = {
  genesis:            { label: 'Genesis Badge',        workoutsThreshold: 1  },
  iron_will:          { label: 'Iron Will',             streakThreshold: 7,   workoutsThreshold: 7  },
  three_weeks:        { label: 'Three Weeks Strong',    workoutsThreshold: 21 },
  month_champion:     { label: 'Month Champion',        streakThreshold: 30,  workoutsThreshold: 30 },
  consistency_legend: { label: 'Consistency Legend',    streakThreshold: 49,  workoutsThreshold: 49 },
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

  const streak = profile.streak ?? 0
  const totalWorkouts = profile.total_workouts ?? 0

  // For streak-based milestones: eligible if streak OR total_workouts meets the threshold
  // (total_workouts fallback supports retroactive claiming when streak was reset)
  // For workouts-based milestones: only total_workouts counts
  let eligible = false

  if (config.streakThreshold !== undefined) {
    eligible = streak >= config.streakThreshold || totalWorkouts >= config.streakThreshold
  }
  if (!eligible && config.workoutsThreshold !== undefined) {
    eligible = totalWorkouts >= config.workoutsThreshold
  }

  if (!eligible) {
    const needed = config.streakThreshold ?? config.workoutsThreshold ?? 0
    const current = config.streakThreshold !== undefined
      ? `streak: ${streak} days, workouts: ${totalWorkouts}`
      : `${totalWorkouts} check-ins`
    return NextResponse.json({
      error: `Not yet eligible for ${config.label}. Need ${needed}, currently: ${current}.`,
    }, { status: 403 })
  }

  // Check if already claimed
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id, claimed_at')
    .eq('user_id', user.id)
    .eq('milestone', milestone)
    .single()

  if (existing?.claimed_at) {
    return NextResponse.json({ alreadyClaimed: true, milestone, label: config.label })
  }

  // Upsert claim record
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

  return NextResponse.json({
    success: true,
    milestone,
    label: config.label,
    walletAddress: profile.wallet_address ?? null,
  })
}
