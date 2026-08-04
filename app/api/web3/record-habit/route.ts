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
import { avalanche } from 'viem/chains'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Minimal ABI slice — only what this route needs
const REGISTRY_ABI = parseAbi([
  'function adminRecordHabitForUser(address targetUser, string habitType, string metadataUri) external',
  'function canRecordToday(address user) external view returns (bool)',
])

const chain = avalanche
const rpcUrl = 'https://api.avax.network/ext/bc/C/rpc'

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

    // The wallet must be the one registered on the caller's own profile —
    // otherwise any signed-in user could mint to arbitrary addresses.
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', user.id)
      .single()

    if (!profile?.wallet_address || profile.wallet_address.toLowerCase() !== String(targetWallet).toLowerCase()) {
      return NextResponse.json({ error: 'Wallet does not match your profile' }, { status: 403 })
    }

    // Mint only against a real check-in: a workout logged today (UTC, matching
    // the contract's per-UTC-day rate limit).
    const utcDayStart = new Date()
    utcDayStart.setUTCHours(0, 0, 0, 0)
    const { count: todayWorkouts } = await supabase
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', utcDayStart.toISOString())

    if (!todayWorkouts) {
      return NextResponse.json({ error: 'No check-in recorded today' }, { status: 403 })
    }

    // Per-user daily limit via the service-role-only mint log. The on-chain
    // canRecordToday check is per-wallet, and wallet_address is user-writable,
    // so without this a user could rotate wallets to mint repeatedly.
    const adminClient = createAdminClient()
    if (adminClient) {
      const { count: mintsToday } = await adminClient
        .from('onchain_mint_log')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('minted_at', utcDayStart.toISOString())

      if (mintsToday) {
        return NextResponse.json({ skipped: true, reason: 'Already recorded today' })
      }
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

    if (adminClient) {
      await adminClient.from('onchain_mint_log').insert({
        user_id: user.id,
        wallet: targetWallet,
        habit_type: habitType,
        tx_hash: txHash,
      })
    }

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
