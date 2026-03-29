import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/trainers/[id] — fetch a single trainer profile by its UUID
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    return NextResponse.json({ trainer: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
