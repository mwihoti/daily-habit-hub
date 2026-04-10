/**
 * DIY self-custodial embedded wallet.
 *
 * Generates an Ethereum key pair in-browser using viem.
 * The private key is stored in localStorage — it never leaves the browser.
 * Only the public address is synced to Supabase (profiles.wallet_address).
 *
 * Limitations:
 *  - Key is per-browser. Clearing localStorage = wallet is gone unless exported.
 *  - Use "Export Key" to back up / import into MetaMask.
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

export interface EmbeddedWallet {
  privateKey: `0x${string}`
  address: `0x${string}`
}

const storageKey = (uid: string) => `dhh_wallet_${uid}`

/** Returns an existing wallet for this user, or creates one if none exists. */
export function getOrCreateEmbeddedWallet(userId: string): EmbeddedWallet | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(storageKey(userId))
  if (raw) {
    try {
      const { privateKey } = JSON.parse(raw) as EmbeddedWallet
      const address = privateKeyToAccount(privateKey).address
      return { privateKey, address }
    } catch {
      // Corrupted entry — regenerate below
    }
  }

  const privateKey = generatePrivateKey()
  const address = privateKeyToAccount(privateKey).address
  localStorage.setItem(storageKey(userId), JSON.stringify({ privateKey, address }))
  return { privateKey, address }
}

/** Returns the existing wallet for this user, or null if none has been created. */
export function getEmbeddedWallet(userId: string): EmbeddedWallet | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(storageKey(userId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as EmbeddedWallet
  } catch {
    return null
  }
}

/** Removes the wallet from localStorage. Does NOT affect the on-chain address. */
export function clearEmbeddedWallet(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(userId))
}
