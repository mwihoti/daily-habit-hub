import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const safeNext = next.startsWith('/') ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }

    console.error('OAuth callback exchange failed:', error.message)

    const errorParams = new URLSearchParams({
      error: 'auth_error',
      message: error.message,
      code: error.code ?? 'unknown',
    })

    return NextResponse.redirect(`${origin}/login?${errorParams.toString()}`)
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth_error&message=Missing+OAuth+code+in+callback`
  )
}
