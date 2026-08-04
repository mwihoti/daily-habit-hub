import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Web Push helpers shared by the send and reminder endpoints.
 * Payload shape matches what public/sw.js expects: { title, body, url, tag }.
 */

export interface PushSubscriptionRow {
  endpoint: string
  p256dh: string
  auth: string
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

let vapidInitialized = false

/** Configure VAPID once per process. Returns false when keys are missing. */
export function initVapid(): boolean {
  if (vapidInitialized) return true
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@fittribe.ke'
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidInitialized = true
  return true
}

/**
 * Send one payload to many subscriptions; expired subscriptions (410 Gone)
 * are deleted. Returns how many sends succeeded.
 */
export async function sendToSubscriptions(
  supabase: SupabaseClient,
  subscriptions: PushSubscriptionRow[],
  payload: PushPayload,
): Promise<number> {
  const body = JSON.stringify(payload)
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush
        .sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body)
        .catch(async (err) => {
          if (err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          }
          throw err
        })
    )
  )
  return results.filter((r) => r.status === 'fulfilled').length
}
