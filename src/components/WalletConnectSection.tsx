'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { useEmbeddedWallet } from '@/hooks/useEmbeddedWallet'
import {
  encryptPrivateKey,
  decryptPrivateKey,
  restoreEmbeddedWallet,
  getEmbeddedWallet,
} from '@/lib/web3/embeddedWallet'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Copy, Key, AlertTriangle, CloudUpload, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { WalletPinDialog } from '@/components/WalletPinDialog'
import { MetaMaskImportGuide } from '@/components/MetaMaskImportGuide'

interface WalletConnectSectionProps {
  /** Supabase user ID — required for creating / reading the embedded wallet. */
  userId?: string
}

type BackupStatus = 'checking' | 'backed-up' | 'not-backed-up' | 'unknown'

/**
 * Unified wallet UI.
 *
 * State A — no wallet + no backup:    Create In-App Wallet  |  Connect External Wallet
 * State A2 — no local wallet, backup exists: "Restore your wallet" CTA
 * State B — embedded active:          Address display, Copy, Backup/Restore, Export, MetaMask guide
 * State C — external connected:       RainbowKit ConnectButton
 */
export function WalletConnectSection({ userId }: WalletConnectSectionProps) {
  const {
    walletType,
    embeddedAddress,
    createEmbeddedWallet,
    getExportKey,
    refreshWallet,
  } = useEmbeddedWallet(userId)

  const [isCreating, setIsCreating] = useState(false)
  const [backupStatus, setBackupStatus] = useState<BackupStatus>('checking')
  const [pinDialogMode, setPinDialogMode] = useState<'set' | 'restore' | null>(null)
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState(false)
  const supabase = createClient()

  // Check if a backup exists in Supabase
  useEffect(() => {
    if (!userId) {
      setBackupStatus('unknown')
      return
    }
    supabase
      .from('profiles')
      .select('encrypted_wallet_key')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) setBackupStatus('unknown')
        else setBackupStatus(data?.encrypted_wallet_key ? 'backed-up' : 'not-backed-up')
      })
  }, [userId, embeddedAddress])

  const handleCreateWallet = async () => {
    if (!userId) {
      toast.error('Please sign in first')
      return
    }
    setIsCreating(true)
    try {
      const address = createEmbeddedWallet(userId)
      if (!address) throw new Error('Failed to generate wallet')
      await supabase.from('profiles').update({ wallet_address: address }).eq('id', userId)
      toast.success('Wallet created — your $HABIT tokens will be minted here!')
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

  // PIN confirm → encrypt key → save bundle to Supabase
  const handleBackupConfirm = async (pin: string) => {
    if (!userId) throw new Error('Not signed in')
    const pk = getExportKey(userId)
    if (!pk) throw new Error('No wallet found in this browser')
    const bundle = await encryptPrivateKey(pk, pin)
    const { error } = await supabase.from('profiles').update({
      encrypted_wallet_key: bundle.ciphertext,
      wallet_key_iv: bundle.iv,
      wallet_key_salt: bundle.salt,
    }).eq('id', userId)
    if (error) throw new Error(error.message)
    setBackupStatus('backed-up')
    setPinDialogMode(null)
    toast.success('Wallet backed up! You can now restore it on any device.', { duration: 5000 })
  }

  // PIN confirm → fetch encrypted bundle → decrypt → restore to localStorage
  const handleRestoreConfirm = async (pin: string) => {
    if (!userId) throw new Error('Not signed in')
    const { data, error } = await supabase
      .from('profiles')
      .select('encrypted_wallet_key, wallet_key_iv, wallet_key_salt, wallet_address')
      .eq('id', userId)
      .single()
    if (error || !data?.encrypted_wallet_key) throw new Error('No backup found')
    let pk: `0x${string}`
    try {
      pk = await decryptPrivateKey(
        { ciphertext: data.encrypted_wallet_key, iv: data.wallet_key_iv, salt: data.wallet_key_salt },
        pin,
      )
    } catch {
      throw new Error('Wrong PIN — decryption failed.')
    }
    const restored = restoreEmbeddedWallet(userId, pk)
    if (!restored) throw new Error('Failed to restore wallet')
    // Ensure address is still synced in Supabase
    await supabase.from('profiles').update({ wallet_address: restored.address }).eq('id', userId)
    refreshWallet()
    setPinDialogMode(null)
    toast.success('Wallet restored to this device!')
  }

  const exportKey = userId ? getExportKey(userId) : null

  // ── State C: external wallet connected ──────────────────────────────────────
  if (walletType === 'external') {
    return (
      <div className="space-y-3 w-full">
        <ConnectButton />
        <p className="text-[10px] text-center text-muted-foreground">
          External wallet connected. Tokens are minted to this address.
        </p>
      </div>
    )
  }

  // ── State A2: backup exists but no local wallet ──────────────────────────────
  const hasLocalWallet = !!embeddedAddress
  const hasCloudBackup = backupStatus === 'backed-up'

  if (!hasLocalWallet && hasCloudBackup) {
    return (
      <>
        <div className="space-y-3 w-full">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-2">
            <div className="text-2xl">☁️</div>
            <p className="text-sm font-semibold">Wallet backup found</p>
            <p className="text-xs text-muted-foreground">
              You have a cloud backup from another device. Enter your PIN to restore it here.
            </p>
            <Button variant="hero" className="w-full mt-2" onClick={() => setPinDialogMode('restore')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Restore My Wallet
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or start fresh</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleCreateWallet} disabled={isCreating}>
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create New Wallet'}
          </Button>

          <div className="flex justify-center">
            <ConnectButton label="Connect External Wallet" />
          </div>
        </div>

        <WalletPinDialog
          open={pinDialogMode === 'restore'}
          mode="restore"
          onClose={() => setPinDialogMode(null)}
          onConfirm={handleRestoreConfirm}
        />
      </>
    )
  }

  // ── State B: embedded wallet active ─────────────────────────────────────────
  if (walletType === 'embedded' && embeddedAddress) {
    return (
      <>
        <div className="space-y-3 w-full">
          {/* Address row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  In-App Wallet
                </p>
                {backupStatus === 'backed-up' && (
                  <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Backed up
                  </span>
                )}
                {backupStatus === 'not-backed-up' && (
                  <span className="flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    Not backed up
                  </span>
                )}
              </div>
              <p className="font-mono text-sm font-medium">
                {embeddedAddress.slice(0, 6)}...{embeddedAddress.slice(-4)}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="icon" className="w-8 h-8" title="Copy address" onClick={handleCopyAddress}>
                <Copy className="w-4 h-4" />
              </Button>
              {exportKey && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  title="Export to MetaMask"
                  onClick={() => setShowMetaMaskGuide(true)}
                >
                  <Key className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Backup CTA when not yet backed up */}
          {backupStatus === 'not-backed-up' && (
            <button
              onClick={() => setPinDialogMode('set')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-amber-400/50 hover:border-amber-400 hover:bg-amber-500/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <CloudUpload className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Back up your wallet</p>
                <p className="text-[10px] text-muted-foreground">Protect against losing your wallet if you clear browser data.</p>
              </div>
            </button>
          )}

          {/* Already backed up — quiet status */}
          {backupStatus === 'backed-up' && (
            <div className="flex items-center gap-2 px-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Cloud backup active — you can restore this wallet on any device.
              </p>
            </div>
          )}

          {/* Browser-only warning (only when not backed up) */}
          {backupStatus !== 'backed-up' && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-600 dark:text-yellow-400 leading-relaxed">
                Stored in this browser only. Back up or export your key to avoid losing access.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex justify-center">
            <ConnectButton label="Use External Wallet Instead" />
          </div>
        </div>

        <WalletPinDialog
          open={pinDialogMode === 'set'}
          mode="set"
          onClose={() => setPinDialogMode(null)}
          onConfirm={handleBackupConfirm}
        />

        {exportKey && (
          <MetaMaskImportGuide
            open={showMetaMaskGuide}
            onClose={() => setShowMetaMaskGuide(false)}
            privateKey={exportKey}
          />
        )}
      </>
    )
  }

  // ── State A: no wallet ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { emoji: '🪙', label: '10 $HABIT\nper check-in' },
          { emoji: '🔥', label: 'NFT badges\nfor milestones' },
          { emoji: '🏆', label: 'Leaderboard\nrankings' },
        ].map((b) => (
          <div key={b.label} className="p-2.5 rounded-xl bg-muted/60">
            <span className="text-xl block mb-1">{b.emoji}</span>
            <span className="text-[10px] text-muted-foreground font-semibold whitespace-pre-line leading-tight">{b.label}</span>
          </div>
        ))}
      </div>

      <Button
        variant="hero"
        className="w-full"
        onClick={handleCreateWallet}
        disabled={isCreating || !userId}
      >
        {isCreating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Create In-App Wallet (no MetaMask needed)'
        )}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or connect your own</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex justify-center">
        <ConnectButton label="Connect External Wallet" />
      </div>

      <p className="text-[10px] text-center text-muted-foreground px-2">
        Your wallet address receives $HABIT tokens and NFTs — you never pay gas fees.
      </p>
    </div>
  )
}
