/**
 * POST /api/web3/record-habit
 *
 * Server-side Approach 2: admin wallet calls adminRecordHabitForUser
 * on behalf of a user who has a connected wallet in their profile.
 *
 * Required env vars (server-only — no NEXT_PUBLIC_ prefix):
 *   PRIVATE_ADMIN_KEY
 *   NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS
 *
 * Body: { targetWallet: string, habitType: string, metadataUri?: string }
 */
import { NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { avalancheFuji, avalanche } from 'viem/chains'
import { createClient } from '@/lib/supabase/server'

// Minimal ABI slice — only what this route needs
const REGISTRY_ABI = parseAbi([
  'function adminRecordHabitForUser(address targetUser, string habitType, string metadataUri) external',
  'function canRecordToday(address user) external view returns (bool)',
])

const isProduction = process.env.NODE_ENV === 'production'
const chain = isProduction ? avalanche : avalancheFuji
const rpcUrl = isProduction
  ? 'https://api.avax.network/ext/bc/C/rpc'
  : 'https://api.avax-test.network/ext/bc/C/rpc'

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetWallet, habitType, metadataUri = '' } = await request.json()

    if (!targetWallet || !habitType) {
      return NextResponse.json({ error: 'targetWallet and habitType are required' }, { status: 400 })
    }

    const adminKeyRaw = process.env.PRIVATE_ADMIN_KEY
    if (!adminKeyRaw) {
      return NextResponse.json({ error: 'Admin key not configured' }, { status: 500 })
    }

    const registryAddress = process.env.NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS as `0x${string}`
    if (!registryAddress || registryAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'Contract not deployed yet' }, { status: 503 })
    }

    const adminKey = (adminKeyRaw.startsWith('0x') ? adminKeyRaw : `0x${adminKeyRaw}`) as `0x${string}`
    const account = privateKeyToAccount(adminKey)
    const transport = http(rpcUrl)

    const publicClient = createPublicClient({ chain, transport })
    const walletClient = createWalletClient({ account, chain, transport })

    // Check rate limit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canRecord = await (publicClient as any).readContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: 'canRecordToday',
      args: [targetWallet as `0x${string}`],
    }) as boolean

    if (!canRecord) {
      return NextResponse.json({ skipped: true, reason: 'Already recorded today on-chain' })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txHash = await (walletClient as any).writeContract({
      address: registryAddress,
      abi: REGISTRY_ABI,
      functionName: 'adminRecordHabitForUser',
      args: [targetWallet as `0x${string}`, habitType, metadataUri],
      account,
      chain,
    }) as `0x${string}`

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber: receipt.blockNumber.toString(),
    })
  } catch (err: any) {
    console.error('[record-habit]', err?.shortMessage ?? err?.message ?? err)
    return NextResponse.json({ error: err?.shortMessage ?? err?.message ?? 'Server error' }, { status: 500 })
  }
}
