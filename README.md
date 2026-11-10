# 🔥 FitTribe

**Chase your goal. Keep your streak. Prove you showed up.**

FitTribe is a streak accountability app. Pick a goal, check in once a day, and keep the streak alive alongside a community that can see whether you showed up. It works for fitness, study, building a business, or any daily habit.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)](https://www.avax.network/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Live app:** https://fittribe.club

> This repository is named `daily-habit-hub`, the project's original name. The product is FitTribe.

---

## What it does

1. **Pick your goal** — fitness, study, a business, your craft, or any daily habit.
2. **Check in once a day** — one tap, with an optional note and photo. It takes about 30 seconds.
3. **Keep the streak** — your streak, week calendar and heatmap update, and the community feed and leaderboard show who is still going.
4. **Earn proof** — milestone badges at 1, 7, 21, 30 and 49 days, with an optional on-chain record of your consistency.

Free to use. No wallet setup and no gas fees for users.

---

## Features

### Streaks and tracking

| Feature | Description |
|---------|-------------|
| Daily check-in | One-tap logging across Move, Recover and Build activities (gym, run, walk, mobility, sleep, meal prep, personal project, custom win), with optional photo |
| Streak tracking | Daily streak counter, week calendar and milestone badges |
| Progress | Monthly heatmap and trend metrics |
| Goals and tasks | Set goals and daily tasks with due-date reminders |
| Accountability summaries | Weekly summary of your consistency, rule-based by default with optional AI wording (Gemini or OpenRouter) |

### Community

| Feature | Description |
|---------|-------------|
| Community feed | Public check-ins with likes and comments |
| Leaderboard | Top 50 users ranked by streak |
| Graffiti wall | A procedural profile skin that levels up with your check-ins: tag → throw-up → piece → burner → king → all-city |
| Shareable achievements | Public achievement pages with generated preview images |

### Reminders and install

| Feature | Description |
|---------|-------------|
| Push notifications | Task and streak-risk reminders delivered through the service worker, even when the app is closed |
| Installable | Progressive web app with a manifest and service worker |
| Android | Trusted Web Activity wrapper in `android-twa/` |

### On-chain record (optional, Avalanche)

| Feature | Description |
|---------|-------------|
| $HABIT | 10 $HABIT minted per eligible check-in by a server wallet, so users pay no gas |
| Achievement badges | Soulbound (non-transferable) NFTs at 7, 30 and 100 on-chain check-ins |
| In-app wallet | Self-custodial wallet generated in one click; MetaMask not required |
| Encrypted backup | PIN-encrypted key backup (AES-GCM 256-bit) with cross-device restore |
| Verification | Every record is visible on the Avalanche explorer |

$HABIT is a record of consistency. **It currently has no monetary value.**

### Coaching (built, currently switched off)

A trainer marketplace with coach profiles and real-time messaging is fully built but hidden while the product focuses on streak accountability. Set `NEXT_PUBLIC_FEATURE_TRAINERS=true` to bring back the routes, navigation and sitemap entries.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database and auth | Supabase (PostgreSQL, row-level security, Realtime); email/password and Google sign-in |
| Styling | Tailwind CSS v3, shadcn/ui (Radix UI) |
| State | TanStack Query v5 |
| Push | Web Push (VAPID) with a service worker |
| Smart contracts | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Web3 client | wagmi v2, RainbowKit v2, viem |
| Storage | Supabase Storage (photos), Pinata IPFS (metadata, optional) |
| Testing | Vitest and Testing Library |
| Deployment | Vercel (app), Avalanche C-Chain mainnet (contracts) |

---

## Getting started

### Prerequisites

- Node.js 20.9 or later
- npm
- A Supabase project

### 1. Clone and install

```bash
git clone https://github.com/mwihoti/daily-habit-hub.git
cd daily-habit-hub
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill it in. `.env.example` is the full reference; the main groups are:

| Variables | Needed for |
|-----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required. Database and auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Cron reminders and the mint log |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and share links (defaults to `https://fittribe.club`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Push notifications. Generate keys with `npx web-push generate-vapid-keys` |
| `CRON_SECRET`, `PUSH_SEND_SECRET` | Protecting the cron and broadcast endpoints |
| `NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS`, `NEXT_PUBLIC_HABIT_TOKEN_ADDRESS`, `NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS` | On-chain record (addresses below) |
| `PRIVATE_ADMIN_KEY` | Server-only. The wallet that pays gas and mints |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Connecting external wallets |
| `PINATA_API_KEY`, `PINATA_SECRET_KEY` | Optional. IPFS pinning for check-in metadata |
| `ACCOUNTABILITY_AI_PROVIDER`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY` | Optional. AI-worded accountability summaries |
| `NEXT_PUBLIC_FEATURE_TRAINERS` | Optional. Set to `true` to enable coaching |

Never commit `.env`. Keep `PRIVATE_ADMIN_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in your host's secret store.

### 3. Database

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Or run the SQL files in `supabase/migrations/` in order from the Supabase SQL editor.

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run test:run   # test suite
npm run build      # production build
```

---

## Project structure

```
app/                  Next.js routes, API routes, metadata (sitemap, robots, OG images)
src/components/       Shared UI components
src/lib/              Streak, accountability, push, SEO, Supabase and web3 helpers
supabase/migrations/  Database schema and functions
contracts/            HabitRegistry, HabitToken, AchievementNFT
scripts/              Contract deployment and icon generation
android-twa/          Android Trusted Web Activity wrapper
__tests__/            Vitest suites
```

---

## Scheduled jobs

Defined in `vercel.json`:

| Path | Schedule (UTC) | Purpose |
|------|----------------|---------|
| `/api/push/reminders` | Daily at 16:00 | Task and streak-risk reminders |
| `/api/web3/process-mints` | Daily at 17:30 | Processes the mint queue and retries failures |

---

## Database

| Table | Purpose |
|-------|---------|
| `profiles` | User profile, streak state, wallet address, encrypted wallet backup |
| `workouts` | Check-ins (type, note, photo, public flag); public ones form the community feed |
| `goals`, `tasks` | Goals and daily tasks with reminders |
| `user_achievements` | Claimed milestone badges |
| `push_subscriptions` | Web Push subscriptions |
| `trainer_profiles`, `conversations`, `messages` | Coaching and messaging (feature-flagged) |

`record_checkin(p_user_id)` updates the streak atomically, handling consecutive days and resets after a missed day.

---

## On-chain details

### Contracts (Avalanche C-Chain mainnet)

| Contract | Address | Description |
|----------|---------|-------------|
| HabitRegistry | [`0xAb9d332EDeEAB63fc84B72dB7B48Ff81962A6597`](https://snowscan.xyz/address/0xAb9d332EDeEAB63fc84B72dB7B48Ff81962A6597) | Check-in registry, limited to one per wallet per UTC day |
| HabitToken ($HABIT) | [`0xf392A21a7230a103271ecb88028aDE17B470A267`](https://snowscan.xyz/address/0xf392A21a7230a103271ecb88028aDE17B470A267) | ERC-20, 21,000,000 cap, minted only by HabitRegistry |
| AchievementNFT (FITA) | [`0xc10e391172fE5E6723422F05197bBc95b35D9188`](https://snowscan.xyz/address/0xc10e391172fE5E6723422F05197bBc95b35D9188) | Soulbound ERC-721 achievement badges |

### Flow

```
User checks in
     │
     ▼
Supabase (streak + check-in record)
     │
     ▼
POST /api/web3/record-habit  ← server-side admin wallet
     │
     ▼
HabitRegistry.adminRecordHabitForUser(wallet, type, metadataUri)
     │
     ├── mints 10 $HABIT → user wallet
     └── at 7/30/100 check-ins → AchievementNFT.mintAchievement()
```

Only the server wallet pays gas. Failed mints are queued and retried by the daily job.

### Badges

| Badge | Trigger | Where |
|-------|---------|-------|
| Genesis | 1st check-in | App |
| Iron Will | 7-day streak | App |
| Three Weeks Strong | 21 check-ins | App |
| Month Champion | 30-day streak | App |
| Consistency Legend | 49-day streak | App |
| Week Warrior | 7 on-chain check-ins | NFT (type 0) |
| Iron Consistent | 30 on-chain check-ins | NFT (type 1) |
| Century Club | 100 on-chain check-ins | NFT (type 2) |

Badges can be claimed retroactively by users who built a streak before setting up a wallet.

### Deploying contracts

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network avalanche
npx hardhat verify --network avalanche <CONTRACT_ADDRESS> [constructor args]
```

---

## Security

- `PRIVATE_ADMIN_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only and never sent to the client.
- User wallet keys stay in the browser. Cloud backups are encrypted with AES-GCM 256-bit using a PIN-derived key (PBKDF2, 100k iterations); the PIN is never stored.
- Row-level security is enforced on all Supabase tables.
- Sessions are validated server-side.
- `adminRecordHabitForUser` is `onlyOwner`, and NFT minting is restricted to the minter role.

---

## Roadmap

### ✅ Phase 1 — Core app (complete)
- [x] Daily check-in with photo upload and IPFS pinning
- [x] Streak tracking with an atomic database function
- [x] Community feed with likes and comments
- [x] Leaderboard and graffiti wall
- [x] Goals and tasks management
- [x] Progress analytics and heatmap
- [x] Trainer marketplace and real-time messaging (now feature-flagged off)

### ✅ Phase 2 — On-chain record (complete)
- [x] HabitRegistry, HabitToken and AchievementNFT deployed on Avalanche mainnet
- [x] Admin wallet minting (zero gas for users)
- [x] In-app self-custodial wallet (no MetaMask required)
- [x] PIN-encrypted cloud key backup and cross-device restore
- [x] Achievements page with explorer verification links
- [x] Badge SVG download
- [x] Mint queue with daily retry of failed mints

### 🔄 Phase 3 — Growth (in progress)
- [x] Push notifications via service worker (task and streak reminders)
- [x] Check-ins for any goal, not only workouts
- [x] Weekly accountability summaries
- [x] Shareable public achievement pages
- [x] Installable web app and Android wrapper
- [x] Dark-first redesign with check-in as the primary action
- [x] Canonical domain moved to fittribe.club
- [ ] Group challenges
- [ ] Nairobi gym and community partnerships
- [ ] Mobile app (React Native / Expo)
- [ ] $HABIT token listing on a DEX
- [ ] Coach payment in $HABIT tokens

### 🔮 Phase 4 — Ecosystem (planned)
- [ ] Governance: $HABIT holders vote on new badge types and emission rate
- [ ] Staking: stake $HABIT to boost the streak multiplier
- [ ] API for third-party app integration
- [ ] Expansion beyond Kenya (Uganda, Tanzania, Rwanda)

---

## License

All rights reserved. © 2025–2026 FitTribe.

---

## Contact

- **Live app:** [fittribe.club](https://fittribe.club)
- **GitHub:** [github.com/mwihoti/daily-habit-hub](https://github.com/mwihoti/daily-habit-hub)
