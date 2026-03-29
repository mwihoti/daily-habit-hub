import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/conversations/[id]/messages — fetch all messages in a conversation
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user is a participant
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, trainer_id')
      .eq('id', params.id)
      .or(`user_id.eq.${user.id},trainer_id.eq.${user.id}`)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Reset unread count for this user
    const isTrainer = conv.trainer_id === user.id
    await supabase
      .from('conversations')
      .update(isTrainer ? { unread_trainer: 0 } : { unread_user: 0 })
      .eq('id', params.id)

    return NextResponse.json({ messages: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    // Verify participant and get conversation details
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id, trainer_id, unread_user, unread_trainer')
      .eq('id', params.id)
      .or(`user_id.eq.${user.id},trainer_id.eq.${user.id}`)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Insert the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({ conversation_id: params.id, sender_id: user.id, content: content.trim() })
      .select()
      .single()

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    // Update conversation last_message and increment unread for the other party
    const isTrainer = conv.trainer_id === user.id
    await supabase
      .from('conversations')
      .update({
        last_message: content.trim(),
        last_message_at: new Date().toISOString(),
        ...(isTrainer
          ? { unread_user: (conv.unread_user ?? 0) + 1 }
          : { unread_trainer: (conv.unread_trainer ?? 0) + 1 }),
      })
      .eq('id', params.id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
