/**
 * SVG badge generator for soulbound NFT achievements.
 * Produces a self-contained SVG that can be downloaded directly.
 */

interface BadgeConfig {
  emoji: string
  title: string
  description: string
  gradient: [string, string]  // [from, to]
  accentColor: string
}

const BADGE_CONFIGS: Record<string, BadgeConfig> = {
  genesis: {
    emoji: '⭐',
    title: 'Genesis Badge',
    description: 'First check-in ever',
    gradient: ['#3B82F6', '#1D4ED8'],
    accentColor: '#93C5FD',
  },
  iron_will: {
    emoji: '🛡️',
    title: 'Iron Will',
    description: '7-Day Streak',
    gradient: ['#F97316', '#C2410C'],
    accentColor: '#FED7AA',
  },
  three_weeks: {
    emoji: '🔥',
    title: 'Three Weeks Strong',
    description: '21 Check-ins',
    gradient: ['#F59E0B', '#B45309'],
    accentColor: '#FDE68A',
  },
  month_champion: {
    emoji: '🏆',
    title: 'Month Champion',
    description: '30-Day Streak',
    gradient: ['#EF4444', '#B91C1C'],
    accentColor: '#FCA5A5',
  },
  consistency_legend: {
    emoji: '👑',
    title: 'Consistency Legend',
    description: '49-Day Streak (7 Weeks)',
    gradient: ['#EAB308', '#A16207'],
    accentColor: '#FEF08A',
  },
}

export function generateBadgeSVG(
  milestoneId: string,
  walletAddress?: string,
  claimedAt?: string,
): string {
  const config = BADGE_CONFIGS[milestoneId] ?? BADGE_CONFIGS.genesis
  const [fromColor, toColor] = config.gradient
  const dateStr = claimedAt
    ? new Date(claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const walletShort = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'daily-habit-hub.vercel.app'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" viewBox="0 0 400 440">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${fromColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${toColor};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.15);stop-opacity:1" />
      <stop offset="50%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)" />
    </filter>
  </defs>

  <!-- Card background -->
  <rect width="400" height="440" rx="28" fill="url(#bgGrad)" filter="url(#shadow)" />

  <!-- Shine overlay -->
  <rect width="400" height="440" rx="28" fill="url(#shineGrad)" />

  <!-- Border -->
  <rect x="6" y="6" width="388" height="428" rx="24" fill="none"
        stroke="${config.accentColor}" stroke-width="1.5" stroke-opacity="0.4" />

  <!-- Top accent dots -->
  <circle cx="40" cy="40" r="4" fill="${config.accentColor}" opacity="0.3" />
  <circle cx="360" cy="40" r="4" fill="${config.accentColor}" opacity="0.3" />

  <!-- Soulbound ribbon -->
  <rect x="140" y="22" width="120" height="22" rx="11" fill="rgba(0,0,0,0.25)" />
  <text x="200" y="37" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"
        font-size="10" font-weight="600" fill="${config.accentColor}" letter-spacing="1">SOULBOUND NFT</text>

  <!-- Emoji (large) -->
  <text x="200" y="195" text-anchor="middle"
        font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif"
        font-size="110">
    ${config.emoji}
  </text>

  <!-- Achievement title -->
  <text x="200" y="250" text-anchor="middle"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="26" font-weight="800" fill="white" letter-spacing="-0.5">
    ${config.title}
  </text>

  <!-- Description -->
  <text x="200" y="278" text-anchor="middle"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="14" fill="rgba(255,255,255,0.75)" letter-spacing="0.5">
    ${config.description}
  </text>

  <!-- Divider -->
  <line x1="80" y1="305" x2="320" y2="305" stroke="${config.accentColor}" stroke-width="1" stroke-opacity="0.3" />

  <!-- Branding row -->
  <text x="200" y="330" text-anchor="middle"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="13" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="0.3">
    FitTribe
  </text>

  <!-- Network -->
  <text x="200" y="352" text-anchor="middle"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="11" fill="rgba(255,255,255,0.55)">
    Avalanche C-Chain
  </text>

  <!-- Claimed date -->
  <text x="200" y="372" text-anchor="middle"
        font-family="system-ui,-apple-system,sans-serif"
        font-size="11" fill="rgba(255,255,255,0.45)">
    Claimed ${dateStr}
  </text>

  <!-- Wallet / attribution -->
  <text x="200" y="415" text-anchor="middle"
        font-family="monospace,system-ui"
        font-size="9.5" fill="rgba(255,255,255,0.35)">
    ${walletShort}
  </text>
</svg>`
}

export function downloadBadge(milestoneId: string, walletAddress?: string, claimedAt?: string) {
  const svg = generateBadgeSVG(milestoneId, walletAddress, claimedAt)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fittribe-${milestoneId}-badge.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
