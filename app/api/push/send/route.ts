/**
 * POST /api/push/send
 *
 * Sends a push notification to one or all users.
 * Protected — only callable with the PUSH_SEND_SECRET header or
 * by the authenticated user for self-test.
 *
 * Body:
 *   { userId?: string, title: string, body: string, url?: string, tag?: string }
 *
 * If userId is omitted, broadcasts to ALL subscribers (admin only).
 */
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

let vapidInitialized = false;
function initVapid() {
  if (vapidInitialized) return;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@fittribe.ke';
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error('VAPID env vars not set: NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are required');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidInitialized = true;
}

export async function POST(request: Request) {
  initVapid();
  // Allow authenticated users to send to themselves, or secret-key callers to broadcast
  const secret = request.headers.get('x-push-secret');
  const isAdmin = secret === process.env.PUSH_SEND_SECRET;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, title, body: msgBody, url = '/dashboard', tag } = body;

  if (!title || !msgBody) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
  }

  // Determine which subscriptions to target
  let query = supabase.from('push_subscriptions').select('*');
  if (userId) {
    // Only admins can send to arbitrary users; normal users can only self-send
    if (!isAdmin && userId !== user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    query = query.eq('user_id', userId);
  } else if (!isAdmin) {
    // Non-admin: only self
    query = query.eq('user_id', user!.id);
  }

  const { data: subscriptions, error } = await query;
  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });
  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0, message: 'No subscriptions found' });
  }

  const payload = JSON.stringify({ title, body: msgBody, url, tag });
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch(async (err) => {
        // 410 Gone means the subscription is no longer valid — clean it up
        if (err.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
        throw err;
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  return NextResponse.json({ sent, total: subscriptions.length });
}
