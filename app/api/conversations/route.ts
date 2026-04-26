import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/conversations — list conversations for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user_id.eq.${user.id},trainer_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    const trainerIds = [...new Set(conversations.map((c) => c.trainer_id))]
    const userIds = [...new Set(conversations.map((c) => c.user_id))]

    const [{ data: trainerProfiles }, { data: userProfiles }] = await Promise.all([
      supabase
        .from('trainer_profiles')
        .select('id, full_name, avatar_url, user_id')
        .in('user_id', trainerIds),
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds),
    ])

    const enriched = conversations.map((conv) => ({
      ...conv,
      trainer: trainerProfiles?.find((t) => t.user_id === conv.trainer_id) ?? null,
      user_profile: userProfiles?.find((u) => u.id === conv.user_id) ?? null,
    }))

    return NextResponse.json({ conversations: enriched })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

// POST /api/conversations — start or get existing conversation with a trainer
// Body: { trainer_user_id: string }  (the auth.users.id of the trainer)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trainer_user_id } = await request.json()

    if (!trainer_user_id) {
      return NextResponse.json({ error: 'trainer_user_id is required' }, { status: 400 })
    }

    if (trainer_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot start a conversation with yourself' }, { status: 400 })
    }

    // Upsert — get existing or create new
    const { data, error } = await supabase
      .from('conversations')
      .upsert(
        { user_id: user.id, trainer_id: trainer_user_id },
        { onConflict: 'user_id,trainer_id', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversation: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
