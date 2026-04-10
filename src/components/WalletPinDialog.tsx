'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'

interface WalletPinDialogProps {
  open: boolean
  mode: 'set' | 'restore'
  onClose: () => void
  /** Called with the entered PIN on confirm. */
  onConfirm: (pin: string) => Promise<void>
}

export function WalletPinDialog({ open, mode, onClose, onConfirm }: WalletPinDialogProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isSet = mode === 'set'
  const MIN_LEN = 6

  const handleSubmit = async () => {
    setError('')
    if (pin.length < MIN_LEN) {
      setError(`PIN must be at least ${MIN_LEN} characters.`)
      return
    }
    if (isSet && pin !== confirmPin) {
      setError('PINs do not match.')
      return
    }
    setIsLoading(true)
    try {
      await onConfirm(pin)
      setPin('')
      setConfirmPin('')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Check your PIN.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPin('')
    setConfirmPin('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle>
              {isSet ? 'Protect Your Wallet' : 'Restore Your Wallet'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isSet
              ? 'Set a PIN to encrypt and back up your wallet key to the cloud. You\'ll need this PIN to restore on a new device.'
              : 'Enter the PIN you set when you backed up your wallet. This will restore your private key to this device.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="pin">{isSet ? 'Create PIN' : 'Your PIN'}</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isSet && handleSubmit()}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPin((v) => !v)}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSet && (
            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type={showPin ? 'text' : 'password'}
                placeholder="Repeat your PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {isSet && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                Your PIN is never stored. Only the encrypted key is saved. If you forget your PIN, the backup cannot be recovered.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="hero" className="flex-1" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSet ? (
                'Back Up Wallet'
              ) : (
                'Restore Wallet'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
