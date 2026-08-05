/**
 * GET /api/leaderboard
 *
 * Top-50 streak leaderboard, cached at the CDN edge for 60s. Clients used to
 * run this query against Supabase directly on a 60s poll — at scale that is
 * N queries/minute; through this route it collapses to ~1 per region.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, streak, total_workouts')
    .order('streak', { ascending: false })
    .order('total_workouts', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: 'Could not load leaderboard' }, { status: 500 })
  }

  return NextResponse.json(
    { leaders: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  )
}
