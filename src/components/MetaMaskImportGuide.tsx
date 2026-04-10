'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface MetaMaskImportGuideProps {
  open: boolean
  onClose: () => void
  privateKey: string
}

const steps = [
  {
    n: 1,
    title: 'Open MetaMask',
    desc: 'Click the MetaMask extension icon in your browser. If you don\'t have it, install it from metamask.io.',
  },
  {
    n: 2,
    title: 'Open the accounts menu',
    desc: 'Click the circular account icon (top right of the MetaMask popup), then select "Add account or hardware wallet".',
  },
  {
    n: 3,
    title: 'Choose "Import account"',
    desc: 'From the options shown, click "Import account".',
  },
  {
    n: 4,
    title: 'Paste your private key',
    desc: 'Select "Private Key" from the dropdown, paste your exported key, then click "Import".',
  },
  {
    n: 5,
    title: 'Switch to Avalanche Fuji',
    desc: 'In MetaMask, switch the network to "Avalanche Fuji C-Chain" (Chain ID 43113). Your $HABIT tokens and NFTs will be visible there.',
  },
]

export function MetaMaskImportGuide({ open, onClose, privateKey }: MetaMaskImportGuideProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(privateKey)
    toast.success('Private key copied — paste it into MetaMask now.', { duration: 5000 })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🦊</span>
            Import to MetaMask
          </DialogTitle>
          <DialogDescription>
            Follow these steps to use your in-app wallet in MetaMask on any device.
          </DialogDescription>
        </DialogHeader>

        {/* Private key copy row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Your Private Key
            </p>
            <p className="font-mono text-xs text-foreground">
              {privateKey.slice(0, 10)}••••••••••••••{privateKey.slice(-6)}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5" />
            Copy
          </Button>
        </div>

        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
            Never share your private key with anyone. Anyone with this key has full control of your wallet.
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-4 pt-1">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Done
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-1.5"
            asChild
          >
            <a href="https://metamask.io/download" target="_blank" rel="noopener noreferrer">
              Get MetaMask <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
