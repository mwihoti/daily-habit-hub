/**
 * DIY self-custodial embedded wallet.
 *
 * Generates an Ethereum key pair in-browser using viem.
 * The private key is stored in localStorage — it never leaves the browser
 * unless the user explicitly backs it up (PIN-encrypted) or exports it.
 * Only the public address is synced to Supabase (profiles.wallet_address).
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

export interface EmbeddedWallet {
  privateKey: `0x${string}`
  address: `0x${string}`
}

export interface EncryptedKeyBundle {
  ciphertext: string // base64
  iv: string         // base64, 12 bytes
  salt: string       // base64, 16 bytes
}

const storageKey = (uid: string) => `dhh_wallet_${uid}`

// ── Local storage helpers ──────────────────────────────────────────────────────

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

/** Restores a wallet into localStorage from a raw private key (after decryption). */
export function restoreEmbeddedWallet(userId: string, privateKey: `0x${string}`): EmbeddedWallet | null {
  if (typeof window === 'undefined') return null
  try {
    const address = privateKeyToAccount(privateKey).address
    localStorage.setItem(storageKey(userId), JSON.stringify({ privateKey, address }))
    return { privateKey, address }
  } catch {
    return null
  }
}

// ── PIN-encrypted backup (AES-GCM 256 + PBKDF2) ──────────────────────────────

function buf2b64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b642buf(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

async function deriveKey(pin: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypt a private key with a user PIN.
 * Returns { ciphertext, iv, salt } — all base64. Store in Supabase; never store the PIN.
 */
export async function encryptPrivateKey(
  privateKey: string,
  pin: string,
): Promise<EncryptedKeyBundle> {
  const salt = crypto.getRandomValues(new Uint8Array(16)).buffer
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer
  const key = await deriveKey(pin, salt)
  const enc = new TextEncoder()
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(privateKey))
  return {
    ciphertext: buf2b64(cipherBuf),
    iv: buf2b64(iv),
    salt: buf2b64(salt),
  }
}

/**
 * Decrypt a backed-up private key using the user's PIN.
 * Throws if the PIN is wrong (AES-GCM authentication tag failure).
 */
export async function decryptPrivateKey(
  bundle: EncryptedKeyBundle,
  pin: string,
): Promise<`0x${string}`> {
  const salt = b642buf(bundle.salt)
  const iv = b642buf(bundle.iv)
  const cipherBuf = b642buf(bundle.ciphertext)
  const key = await deriveKey(pin, salt)
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf)
  return new TextDecoder().decode(plainBuf) as `0x${string}`
}
