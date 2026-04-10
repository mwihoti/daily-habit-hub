'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { useEmbeddedWallet } from '@/hooks/useEmbeddedWallet'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Copy, Key, AlertTriangle } from 'lucide-react'

interface WalletConnectSectionProps {
  /** Supabase user ID — required for creating / reading the embedded wallet. */
  userId?: string
}

/**
 * Unified wallet UI. Replaces every standalone <ConnectButton /> in the app.
 *
 * State A — no wallet: shows "Create In-App Wallet" + "Connect External Wallet"
 * State B — embedded active: shows address, Copy, Export Key buttons + browser warning
 * State C — external connected: shows RainbowKit ConnectButton for management
 */
export function WalletConnectSection({ userId }: WalletConnectSectionProps) {
  const {
    walletType,
    embeddedAddress,
    createEmbeddedWallet,
    getExportKey,
  } = useEmbeddedWallet(userId)
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()

  const handleCreateWallet = async () => {
    if (!userId) {
      toast.error('Please sign in first')
      return
    }
    setIsCreating(true)
    try {
      const address = createEmbeddedWallet(userId)
      if (!address) throw new Error('Failed to generate wallet')
      // Sync address to profile (public key only — private key stays in browser)
      await supabase.from('profiles').update({ wallet_address: address }).eq('id', userId)
      toast.success('Wallet created — your $HABIT tokens will be minted here 🎉')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create wallet')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyAddress = () => {
    if (!embeddedAddress) return
    navigator.clipboard.writeText(embeddedAddress)
    toast.success('Address copied!')
  }

  const handleExportKey = () => {
    if (!userId) return
    const key = getExportKey(userId)
    if (!key) return
    navigator.clipboard.writeText(key)
    toast.success(
      'Private key copied — save it somewhere safe and import into MetaMask to use on other devices.',
      { duration: 7000 }
    )
  }

  // ── State C: external wallet connected ──────────────────────────────────────
  if (walletType === 'external') {
    return <ConnectButton />
  }

  // ── State B: embedded wallet active ─────────────────────────────────────────
  if (walletType === 'embedded' && embeddedAddress) {
    return (
      <div className="space-y-3 w-full">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              In-App Wallet
            </p>
            <p className="font-mono text-sm font-medium">
              {embeddedAddress.slice(0, 6)}...{embeddedAddress.slice(-4)}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              title="Copy address"
              onClick={handleCopyAddress}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              title="Export private key"
              onClick={handleExportKey}
            >
              <Key className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-yellow-600 dark:text-yellow-400 leading-relaxed">
            Stored in this browser only. Use Export Key to back up or move to another device.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex justify-center">
          <ConnectButton label="Use External Wallet Instead" />
        </div>
      </div>
    )
  }

  // ── State A: no wallet ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        variant="hero"
        className="w-full"
        onClick={handleCreateWallet}
        disabled={isCreating || !userId}
      >
        {isCreating ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Create In-App Wallet (no MetaMask needed)'
        )}
      </Button>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex justify-center">
        <ConnectButton label="Connect External Wallet" />
      </div>
    </div>
  )
}
