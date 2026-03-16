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

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      )
    }

    const { url, anonKey } = getSupabaseEnv()
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabase.auth.getUser(token)

    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code ?? 'get_user_failed' },
        { status: error.status ?? 401 }
      )
    }

    return NextResponse.json({ user: data.user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Unexpected server error' },
      { status: 500 }
    )
  }
}
