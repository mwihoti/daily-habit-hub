/**
 * POST /api/ipfs/pin
 *
 * Uploads workout metadata JSON to Pinata (IPFS) and returns the CID.
 *
 * Required env vars:
 *   PINATA_API_KEY
 *   PINATA_SECRET_KEY
 *
 * Body: { name: string, workout_type: string, note?: string, photo_url?: string, user_id: string }
 * Returns: { cid: string, uri: string }
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey    = process.env.PINATA_API_KEY
    const secretKey = process.env.PINATA_SECRET_KEY

    if (!apiKey || !secretKey) {
      // IPFS is optional — return a deterministic placeholder so the app doesn't break
      return NextResponse.json({
        cid: null,
        uri: 'ipfs://placeholder',
        note: 'PINATA_API_KEY not configured — set it to enable real IPFS pinning',
      })
    }

    const body = await request.json()
    const { workout_type, note, photo_url } = body

    const metadata = {
      name: `FitTribe Check-In — ${workout_type}`,
      description: note || `${workout_type} workout completed on FitTribe`,
      image: photo_url || '',
      attributes: [
        { trait_type: 'Workout Type', value: workout_type },
        { trait_type: 'Platform',     value: 'FitTribe' },
        { trait_type: 'Timestamp',    value: new Date().toISOString() },
      ],
    }

    const pinataBody = {
      pinataContent: metadata,
      pinataMetadata: { name: `fittribe-checkin-${Date.now()}` },
    }

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method:  'POST',
      headers: {
        'Content-Type':    'application/json',
        'pinata_api_key':    apiKey,
        'pinata_secret_api_key': secretKey,
      },
      body: JSON.stringify(pinataBody),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Pinata error: ${err}` }, { status: 500 })
    }

    const data = await res.json()
    const cid = data.IpfsHash as string

    return NextResponse.json({ cid, uri: `ipfs://${cid}` })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
