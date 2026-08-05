/**
 * Server-only admin-wallet minting helpers, shared by the mint-queue worker
 * and the legacy inline path in /api/web3/record-habit.
 *
 * All mints go through the single admin EOA, so callers must serialize —
 * the worker holds the mint-worker lease; the inline path only runs when the
 * queue is unavailable.
 */
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { avalanche } from 'viem/chains'

const REGISTRY_ABI = parseAbi([
  'function adminRecordHabitForUser(address targetUser, string habitType, string metadataUri) external',
  'function canRecordToday(address user) external view returns (bool)',
])

const chain = avalanche
const rpcUrl = 'https://api.avax.network/ext/bc/C/rpc'

export interface MintResult {
  skipped: boolean
  reason?: string
  txHash?: `0x${string}`
  blockNumber?: string
}

function getClients() {
  const adminKeyRaw = process.env.PRIVATE_ADMIN_KEY
  if (!adminKeyRaw) throw new Error('PRIVATE_ADMIN_KEY not configured')

  const registryAddress = process.env.NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS as `0x${string}`
  if (!registryAddress || registryAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Habit registry contract not deployed')
  }

  const adminKey = (adminKeyRaw.startsWith('0x') ? adminKeyRaw : `0x${adminKeyRaw}`) as `0x${string}`
  const account = privateKeyToAccount(adminKey)
  const transport = http(rpcUrl)

  return {
    account,
    registryAddress,
    publicClient: createPublicClient({ chain, transport }),
    walletClient: createWalletClient({ account, chain, transport }),
  }
}

/** Mint one habit record; resolves after on-chain confirmation. */
export async function mintHabitOnChain(
  targetWallet: string,
  habitType: string,
  metadataUri: string,
): Promise<MintResult> {
  const { account, registryAddress, publicClient, walletClient } = getClients()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canRecord = await (publicClient as any).readContract({
    address: registryAddress,
    abi: REGISTRY_ABI,
    functionName: 'canRecordToday',
    args: [targetWallet as `0x${string}`],
  }) as boolean

  if (!canRecord) {
    return { skipped: true, reason: 'Already recorded today on-chain' }
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
  return { skipped: false, txHash, blockNumber: receipt.blockNumber.toString() }
}
