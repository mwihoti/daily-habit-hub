/**
 * Procedural graffiti-wall profile skins.
 *
 * Every user gets a unique wall that evolves through the real graffiti skill
 * ladder as their check-in count grows: tag → throw-up → piece → burner →
 * king of the wall → all-city. The art is a deterministic function of
 * (userId, level, palette, stickers), so the same inputs always render the
 * same wall — anyone can re-derive it from public data, no image storage
 * needed. Follows the self-contained-SVG pattern of web3/badgeGenerator.ts.
 */

export interface WallLevel {
  level: number
  name: string
  min: number // check-ins required
}

export const WALL_LEVELS: WallLevel[] = [
  { level: 0, name: 'Blank Wall', min: 0 },
  { level: 1, name: 'First Tag', min: 1 },
  { level: 2, name: 'Throw-Up', min: 7 },
  { level: 3, name: 'The Piece', min: 21 },
  { level: 4, name: 'Burner', min: 30 },
  { level: 5, name: 'King of the Wall', min: 49 },
  { level: 6, name: 'All-City', min: 100 },
]

export function getWallLevel(totalCheckins: number): WallLevel & { next: (WallLevel & { remaining: number }) | null } {
  let current = WALL_LEVELS[0]
  for (const l of WALL_LEVELS) {
    if (totalCheckins >= l.min) current = l
  }
  const next = WALL_LEVELS.find((l) => l.min > totalCheckins) ?? null
  return {
    ...current,
    next: next ? { ...next, remaining: next.min - totalCheckins } : null,
  }
}

// Palette keyed by the user's dominant activity — the wall's colors say
// something about how they train.
const PALETTES: Record<string, [string, string, string]> = {
  cardio:   ['#38BDF8', '#2563EB', '#22D3EE'],
  strength: ['#F97316', '#EF4444', '#FACC15'],
  mobility: ['#C084FC', '#EC4899', '#818CF8'],
  cycling:  ['#4ADE80', '#16A34A', '#A3E635'],
  default:  ['#F97316', '#38BDF8', '#FACC15'],
}

const TYPE_KEYWORDS: Record<string, string[]> = {
  cardio:   ['run', 'cardio', 'hiit', 'swim', 'jog', 'sprint'],
  strength: ['strength', 'lift', 'gym', 'weight', 'push', 'pull', 'crossfit'],
  mobility: ['yoga', 'stretch', 'mobility', 'pilates', 'meditat'],
  cycling:  ['cycl', 'bike', 'ride', 'spin'],
}

export function getWallPalette(workoutTypes: string[]): [string, string, string] {
  const tally: Record<string, number> = {}
  for (const raw of workoutTypes) {
    const t = (raw || '').toLowerCase()
    for (const [key, words] of Object.entries(TYPE_KEYWORDS)) {
      if (words.some((w) => t.includes(w))) {
        tally[key] = (tally[key] ?? 0) + 1
        break
      }
    }
  }
  const dominant = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0]
  return PALETTES[dominant ?? 'default'] ?? PALETTES.default
}

// ── Deterministic randomness ─────────────────────────────────────────────────

/** FNV-1a 32-bit string hash — stable seed from a user id. */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 PRNG — small, fast, deterministic. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ── SVG layers ───────────────────────────────────────────────────────────────

const W = 800
const H = 360
const TAG_FONT = `'Brush Script MT', 'Segoe Script', cursive`
const BLOCK_FONT = `'Arial Black', 'Impact', sans-serif`

function brickWall(rng: () => number): string {
  const rows: string[] = [`<rect width="${W}" height="${H}" fill="#26292F"/>`]
  const bh = 30
  for (let y = 0; y < H; y += bh) {
    const offset = (y / bh) % 2 === 0 ? 0 : -40
    for (let x = offset; x < W; x += 80) {
      const shade = 0.04 + rng() * 0.05
      rows.push(
        `<rect x="${x + 1}" y="${y + 1}" width="78" height="${bh - 2}" rx="2" fill="#FFFFFF" opacity="${shade.toFixed(3)}"/>`
      )
    }
  }
  // Seeded stains give each wall its own weathering
  for (let i = 0; i < 4; i++) {
    const sx = Math.round(rng() * W)
    const sy = Math.round(rng() * H)
    const r = Math.round(30 + rng() * 60)
    rows.push(`<circle cx="${sx}" cy="${sy}" r="${r}" fill="#000000" opacity="${(0.05 + rng() * 0.08).toFixed(3)}"/>`)
  }
  return rows.join('')
}

function drips(rng: () => number, palette: string[], count: number): string {
  const parts: string[] = []
  for (let i = 0; i < count; i++) {
    const x = Math.round(120 + rng() * (W - 240))
    const len = Math.round(20 + rng() * 55)
    const color = palette[Math.floor(rng() * palette.length)]
    parts.push(
      `<rect x="${x}" y="225" width="5" height="${len}" rx="2.5" fill="${color}" opacity="0.85"/>` +
      `<circle cx="${x + 2.5}" cy="${225 + len}" r="4" fill="${color}" opacity="0.85"/>`
    )
  }
  return parts.join('')
}

function stickerSlaps(rng: () => number, palette: string[], count: number): string {
  const parts: string[] = []
  const n = Math.min(count, 12)
  for (let i = 0; i < n; i++) {
    const x = Math.round(30 + rng() * (W - 60))
    const y = Math.round(H - 45 + rng() * 25)
    const rot = Math.round(rng() * 40 - 20)
    const color = palette[Math.floor(rng() * palette.length)]
    parts.push(
      `<g transform="rotate(${rot} ${x} ${y})">` +
      `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="4" fill="#F8FAFC"/>` +
      `<text x="${x}" y="${y + 5}" font-size="14" text-anchor="middle" fill="${color}">★</text>` +
      `</g>`
    )
  }
  return parts.join('')
}

function crown(x: number, y: number): string {
  return (
    `<path d="M ${x - 26} ${y} L ${x - 18} ${y - 22} L ${x - 9} ${y - 6} L ${x} ${y - 26} ` +
    `L ${x + 9} ${y - 6} L ${x + 18} ${y - 22} L ${x + 26} ${y} Z" ` +
    `fill="#FACC15" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>`
  )
}

function skyline(rng: () => number): string {
  const parts: string[] = []
  let x = 0
  while (x < W) {
    const bw = Math.round(35 + rng() * 55)
    const bh = Math.round(30 + rng() * 70)
    parts.push(`<rect x="${x}" y="${H - bh}" width="${bw - 4}" height="${bh}" fill="#0F1115" opacity="0.9"/>`)
    x += bw
  }
  return parts.join('')
}

export interface WallOptions {
  userId: string
  name: string
  totalCheckins: number
  workoutTypes?: string[]
  stickers?: number // likes received
  streak?: number
}

export function generateWallSVG(opts: WallOptions): string {
  const { userId, totalCheckins, workoutTypes = [], stickers = 0, streak = 0 } = opts
  const { level, name: levelName } = getWallLevel(totalCheckins)
  const palette = getWallPalette(workoutTypes)
  const rng = mulberry32(hashSeed(userId))

  const rawName = (opts.name || 'ATHLETE').trim().toUpperCase()
  const tag = escapeXml(rawName.length > 12 ? rawName.slice(0, 12) : rawName)
  const fontSize = Math.min(110, Math.round(560 / Math.max(tag.length, 3)) + 30)
  const rotation = (rng() * 6 - 3).toFixed(2)
  const cx = W / 2
  const cy = H / 2 + fontSize / 3

  const layers: string[] = []
  layers.push(brickWall(rng))

  if (level >= 6) layers.push(skyline(rng))

  // Burner+: a spray cloud behind the letters
  if (level >= 4) {
    layers.push(
      `<ellipse cx="${cx}" cy="${H / 2}" rx="${Math.min(340, tag.length * 34)}" ry="110" fill="url(#cloud)" opacity="0.9"/>`
    )
  }

  const textCommon = `x="${cx}" y="${cy}" text-anchor="middle" font-family="${BLOCK_FONT}" font-weight="900" font-size="${fontSize}"`

  if (level === 0) {
    // Untouched wall, waiting for a first check-in
    layers.push(
      `<text x="${cx}" y="${H / 2 + 10}" text-anchor="middle" font-family="${TAG_FONT}" font-size="26" fill="#6B7280">this wall is yours — check in to paint it</text>`
    )
  } else if (level === 1) {
    // A small hand-style marker tag in a seeded corner
    const tx = rng() > 0.5 ? 160 + rng() * 80 : W - 240 + rng() * 80
    const ty = 90 + rng() * 160
    layers.push(
      `<text x="${tx}" y="${ty}" text-anchor="middle" font-family="${TAG_FONT}" font-style="italic" font-size="44" fill="${palette[0]}" transform="rotate(${(rng() * 14 - 7).toFixed(1)} ${tx} ${ty})">${tag}</text>`
    )
  } else {
    // Throw-up and beyond: big letters, escalating treatment
    const group: string[] = []
    if (level >= 4) {
      // Wildstyle shadow copies
      group.push(`<text ${textCommon} fill="#0F1115" transform="translate(7 8)">${tag}</text>`)
      group.push(`<text ${textCommon} fill="${palette[2]}" transform="translate(3.5 4)">${tag}</text>`)
    } else if (level >= 3) {
      group.push(`<text ${textCommon} fill="#0F1115" transform="translate(5 6)">${tag}</text>`)
    }
    const fill = level >= 3 ? 'url(#letters)' : palette[0]
    group.push(
      `<text ${textCommon} fill="${fill}" stroke="#0F1115" stroke-width="${level >= 3 ? 5 : 7}" paint-order="stroke" ${level >= 6 ? 'filter="url(#chrome)"' : ''}>${tag}</text>`
    )
    const skew = level >= 4 ? ` skewX(${(rng() * 6 - 3).toFixed(1)})` : ''
    layers.push(`<g transform="rotate(${rotation} ${cx} ${H / 2})${skew}">${group.join('')}</g>`)
  }

  if (level >= 3) layers.push(drips(rng, palette, level >= 5 ? 7 : 4))
  if (level >= 5) layers.push(crown(cx - Math.min(270, tag.length * 27), cy - fontSize + 8))
  if (stickers > 0 && level >= 2) layers.push(stickerSlaps(rng, palette, stickers))

  // All-city: animated chrome shimmer sweeping the letters
  const shimmer = level >= 6
    ? `<rect width="${W}" height="${H}" fill="url(#shine)" opacity="0.35"><animate attributeName="x" from="-${W}" to="${W}" dur="3.5s" repeatCount="indefinite"/></rect>`
    : ''

  const streakChip = streak > 0
    ? `<g><rect x="16" y="16" rx="14" width="${58 + String(streak).length * 11}" height="28" fill="#0F1115" opacity="0.8"/>` +
      `<text x="30" y="36" font-size="16" font-family="${BLOCK_FONT}" fill="#FACC15">🔥 ${streak}</text></g>`
    : ''

  const plaque =
    `<g><rect x="${W - 190}" y="${H - 42}" rx="8" width="174" height="26" fill="#0F1115" opacity="0.8"/>` +
    `<text x="${W - 103}" y="${H - 24}" text-anchor="middle" font-size="13" font-family="${BLOCK_FONT}" fill="#E5E7EB">LV${level} · ${escapeXml(levelName.toUpperCase())}</text></g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Graffiti wall — level ${level}, ${escapeXml(levelName)}">
  <defs>
    <linearGradient id="letters" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette[0]}"/>
      <stop offset="55%" stop-color="${palette[1]}"/>
      <stop offset="100%" stop-color="${palette[2]}"/>
    </linearGradient>
    <radialGradient id="cloud">
      <stop offset="0%" stop-color="#F8FAFC" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#F8FAFC" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="chrome"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#E2E8F0" flood-opacity="0.8"/></filter>
  </defs>
  ${layers.join('\n  ')}
  ${shimmer}
  ${streakChip}
  ${plaque}
</svg>`
}
