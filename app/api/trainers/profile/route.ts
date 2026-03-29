import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/trainers/profile — get the current user's trainer profile
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

// POST /api/trainers/profile — create or update trainer profile (upsert)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      full_name,
      bio,
      location,
      specialties,
      experience_years,
      languages,
      availability,
      price_monthly,
      group_price_monthly,
      avatar_url,
    } = body

    if (!full_name) {
      return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('trainer_profiles')
      .upsert(
        {
          user_id: user.id,
          full_name,
          bio: bio ?? null,
          location: location ?? null,
          specialties: specialties ?? [],
          experience_years: experience_years ?? 0,
          languages: languages ?? ['English'],
          availability: availability ?? null,
          price_monthly: price_monthly ?? 0,
          group_price_monthly: group_price_monthly ?? 0,
          avatar_url: avatar_url ?? null,
          is_active: true,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
