import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for server-only code (cron jobs, audit logs).
 * Bypasses RLS — never import from client components.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured so callers
 * can degrade gracefully instead of crashing the route.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return null

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
