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

  // Fetch user profile stats — auto-create row if missing (handles users whose
  // on_auth_user_created trigger didn't fire or who signed up before the trigger existed)
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('streak, total_workouts, wallet_address')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Attempt to insert a default profile row (DO NOTHING if it somehow already exists
    // to avoid overwriting streak/total_workouts with zeroes)
    const { error: upsertProfileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, streak: 0, total_workouts: 0 }, { onConflict: 'id', ignoreDuplicates: true })

    if (upsertProfileError) {
      return NextResponse.json({ error: 'Profile not found and could not be created' }, { status: 500 })
    }

    // Re-fetch after upsert
    const { data: newProfile, error: refetchError } = await supabase
      .from('profiles')
      .select('streak, total_workouts, wallet_address')
      .eq('id', user.id)
      .single()

    if (refetchError || !newProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    profile = newProfile
  }

  const streak = profile.streak ?? 0

  // Count workouts directly — don't rely solely on denormalized total_workouts
  const { count: liveCount } = await supabase
    .from('workouts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  const totalWorkouts = Math.max(profile.total_workouts ?? 0, liveCount ?? 0)

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
    // If table doesn't exist (migration 004 not yet applied), surface a clear message
    if (upsertError.message.includes('relation') && upsertError.message.includes('does not exist')) {
      return NextResponse.json({
        error: 'Achievement table not set up yet. Please run migration 004 in your Supabase SQL Editor.',
        migration: `CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  is_on_chain BOOLEAN NOT NULL DEFAULT false,
  tx_hash TEXT,
  UNIQUE(user_id, milestone)
);
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_select_own" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert_own" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "achievements_update_own" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);`,
      }, { status: 503 })
    }
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    milestone,
    label: config.label,
    walletAddress: profile.wallet_address ?? null,
  })
}
