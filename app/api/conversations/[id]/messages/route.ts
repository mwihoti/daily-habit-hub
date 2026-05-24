import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function enrichMessagesWithSenders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  messages: Array<{
    id: string
    conversation_id: string
    sender_id: string
    content: string
    created_at: string
    seen_at?: string | null
  }>
) {
  if (messages.length === 0) return []

  const senderIds = [...new Set(messages.map((message) => message.sender_id))]
  const { data: senderProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, last_seen_at')
    .in('id', senderIds)

  return messages.map((message) => ({
    ...message,
    sender: (() => {
      const senderProfile = senderProfiles?.find((profile) => profile.id === message.sender_id)
      if (!senderProfile) return null
      return {
        full_name: senderProfile.full_name ?? null,
        avatar_url: senderProfile.avatar_url ?? null,
        last_seen_at: senderProfile.last_seen_at ?? null,
      }
    })(),
  }))
}

// GET /api/conversations/[id]/messages — fetch all messages in a conversation
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user is a participant
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, trainer_id')
      .eq('id', id)
      .or(`user_id.eq.${user.id},trainer_id.eq.${user.id}`)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at, seen_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', user.id)

    await supabase
      .from('messages')
      .update({ seen_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .neq('sender_id', user.id)
      .is('seen_at', null)

    // Reset unread count for this user
    const isTrainer = conv.trainer_id === user.id
    await supabase
      .from('conversations')
      .update(isTrainer ? { unread_trainer: 0 } : { unread_user: 0 })
      .eq('id', id)

    const enrichedMessages = await enrichMessagesWithSenders(supabase, data ?? [])

    return NextResponse.json({ messages: enrichedMessages })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .eq('id', id)
      .or(`user_id.eq.${user.id},trainer_id.eq.${user.id}`)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Insert the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({ conversation_id: id, sender_id: user.id, content: content.trim() })
      .select('id, conversation_id, sender_id, content, created_at, seen_at')
      .single()

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    // Update conversation last_message and increment unread for the other party
    const isTrainer = conv.trainer_id === user.id
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', user.id)

    await supabase
      .from('conversations')
      .update({
        last_message: content.trim(),
        last_message_at: new Date().toISOString(),
        ...(isTrainer
          ? { unread_user: (conv.unread_user ?? 0) + 1 }
          : { unread_trainer: (conv.unread_trainer ?? 0) + 1 }),
      })
      .eq('id', id)

    const [enrichedMessage] = await enrichMessagesWithSenders(supabase, message ? [message] : [])

    return NextResponse.json({ message: enrichedMessage ?? message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
