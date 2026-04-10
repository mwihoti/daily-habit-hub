'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import {
  getEmbeddedWallet,
  getOrCreateEmbeddedWallet,
  restoreEmbeddedWallet,
} from '@/lib/web3/embeddedWallet'

export type WalletType = 'embedded' | 'external' | null

export interface UseEmbeddedWalletReturn {
  /** Active address: external wallet takes priority over embedded. */
  activeAddress: `0x${string}` | undefined
  walletType: WalletType
  hasWallet: boolean
  embeddedAddress: `0x${string}` | null
  /** Generate (or load existing) embedded wallet. Returns the address. */
  createEmbeddedWallet: (userId: string) => `0x${string}` | null
  /** Returns the raw private key from localStorage for export/backup. */
  getExportKey: (userId: string) => `0x${string}` | null
  /** Re-read embedded wallet from localStorage (call after restore). */
  refreshWallet: () => void
}

/**
 * Unified wallet hook — merges embedded (localStorage) and external (wagmi/MetaMask) wallet state.
 * External wallet always takes priority if connected.
 */
export function useEmbeddedWallet(userId?: string): UseEmbeddedWalletReturn {
  const [embeddedAddress, setEmbeddedAddress] = useState<`0x${string}` | null>(null)
  const { address: externalAddress, isConnected: isExternalConnected } = useAccount()

  const loadFromStorage = useCallback(() => {
    if (!userId) return
    const wallet = getEmbeddedWallet(userId)
    setEmbeddedAddress(wallet?.address ?? null)
  }, [userId])

  // Load existing embedded wallet from localStorage on mount / userId change
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  // External wallet takes priority over embedded
  const activeAddress = isExternalConnected ? externalAddress : (embeddedAddress ?? undefined)
  const walletType: WalletType = isExternalConnected ? 'external'
    : embeddedAddress ? 'embedded'
    : null
  const hasWallet = isExternalConnected || !!embeddedAddress

  const createEmbeddedWallet = useCallback((uid: string): `0x${string}` | null => {
    const wallet = getOrCreateEmbeddedWallet(uid)
    if (!wallet) return null
    setEmbeddedAddress(wallet.address)
    return wallet.address
  }, [])

  const getExportKey = useCallback((uid: string): `0x${string}` | null => {
    return getEmbeddedWallet(uid)?.privateKey ?? null
  }, [])

  const refreshWallet = useCallback(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return {
    activeAddress,
    walletType,
    hasWallet,
    embeddedAddress,
    createEmbeddedWallet,
    getExportKey,
    refreshWallet,
  }
}
