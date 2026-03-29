import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/trainers — list all active trainer profiles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const specialty = searchParams.get('specialty') || ''

    const supabase = await createClient()

    let query = supabase
      .from('trainer_profiles')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,bio.ilike.%${search}%,location.ilike.%${search}%`
      )
    }

    if (specialty && specialty !== 'all') {
      query = query.contains('specialties', [specialty])
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ trainers: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
