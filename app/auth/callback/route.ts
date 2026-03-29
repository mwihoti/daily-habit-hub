import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const safeNext = next.startsWith('/') ? next : '/dashboard'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Check if the user registered as a trainer (role stored in localStorage
        // before the OAuth redirect) — we read it via the `pending_signup_role`
        // query param passed through the redirect URL when possible, but the
        // safest fallback is to check the user's metadata after exchange.
        const supabase2 = await createClient()
        const { data: { user } } = await supabase2.auth.getUser()
        const role = user?.user_metadata?.role
        const redirectPath = role === 'trainer' ? '/trainer-setup' : safeNext
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }

      console.error('OAuth callback exchange failed:', error.message)

      const errorParams = new URLSearchParams({
        error: 'auth_error',
        message: error.message,
        code: error.code ?? 'unknown',
      })

      return NextResponse.redirect(`${origin}/login?${errorParams.toString()}`)
    } catch (err: any) {
      console.error('OAuth callback unexpected error:', err)
      return NextResponse.redirect(
        `${origin}/login?error=auth_error&message=${encodeURIComponent(err?.message ?? 'Unexpected error')}`
      )
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth_error&message=Missing+OAuth+code+in+callback`
  )
}