import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
    )
  }

  return { url, anonKey }
}

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'email and password are required' },
        { status: 400 }
      )
    }

    const { url, anonKey } = getSupabaseEnv()
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...(full_name ? { full_name } : {}),
          ...(role ? { role } : {}),
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code ?? 'signup_failed' },
        { status: error.status ?? 400 }
      )
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Unexpected server error' },
      { status: 500 }
    )
  }
}
