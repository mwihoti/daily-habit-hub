# 🔥 Daily Habit Hub

**Build exercise habits. Earn crypto. Prove your consistency on-chain.**

Daily Habit Hub is a Web3 fitness accountability app where every workout earns **$HABIT tokens** and soulbound **NFT achievement badges** on Avalanche. Users track streaks, connect with certified coaches, and build an on-chain fitness record — with zero gas fees and no MetaMask required.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)](https://www.avax.network/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: Private](https://img.shields.io/badge/License-Private-red.svg)](https://github.com/mwihoti/daily-habit-hub)

**Live App:** https://daily-habit-hub.vercel.app/

---

## 🌍 The Problem

Fitness apps have a retention problem. Most people quit within 30 days because there's no real cost to stopping and no tangible reward for continuing. Traditional social features (likes, streaks) aren't enough — they're forgettable.

Daily Habit Hub solves this with **skin-in-the-game accountability**: your consistency is recorded on-chain and rewarded with tokens you actually own.

---

## ✨ Core Features

### 💪 Fitness Tracking
| Feature | Description |
|---------|-------------|
| Daily Check-in | One-tap workout logging with photo upload and IPFS pinning |
| Streak Tracking | Daily streak counter with visual badges and week calendar |
| Progress Analytics | Monthly workout heatmap, trend metrics, on-chain record count |
| Goals & Tasks | Set fitness goals and daily tasks with due-date reminders |

### 👥 Social & Coaching
| Feature | Description |
|---------|-------------|
| Community Feed | Public workout posts with likes and comments |
| Leaderboard | Top 50 users ranked by streak, updated every minute |
| Trainer Marketplace | Browse certified coaches, view profiles, book sessions |
| Real-time Messaging | Direct chat with trainers via Supabase Realtime |

### ⛓️ Web3 (Avalanche)
| Feature | Description |
|---------|-------------|
| $HABIT Token Rewards | 10 $HABIT minted per check-in, zero gas cost to user |
| Soulbound NFT Badges | Non-transferable achievement NFTs at 7, 30, 100 on-chain check-ins |
| In-App Wallet | Generate a self-custodial wallet in one click (no MetaMask) |
| Cloud Key Backup | PIN-encrypted private key synced to Supabase (AES-GCM 256-bit) |
| Cross-device Restore | Restore wallet from encrypted backup on any device |
| Snowscan Verification | Every achievement and transaction visible on Avalanche Fuji explorer |
| Milestone Claiming | Retroactive claim for users who reached milestones before wallet setup |

---

## 🔺 Avalanche Integration

### Why Avalanche?
- **Sub-second finality** — check-in transactions confirm instantly
- **Low fees** — admin wallet gas costs are negligible (< $0.001 per tx)
- **EVM-compatible** — full Solidity + wagmi/viem tooling support
- **Growing ecosystem** — strong DeFi + gaming + health track communities

### Smart Contracts (Fuji Testnet)

| Contract | Address | Description |
|----------|---------|-------------|
| HabitRegistry | [`0xC578af79b6b727a10505f5aFd288931C75ae37cD`](https://testnet.snowscan.xyz/address/0xC578af79b6b727a10505f5aFd288931C75ae37cD) | Core check-in registry, rate-limited to 1/wallet/UTC day |
| HabitToken ($HABIT) | [`0xF93A86243012c7ABB2B0F2aE0a189614F37aF014`](https://testnet.snowscan.xyz/address/0xF93A86243012c7ABB2B0F2aE0a189614F37aF014) | ERC-20 reward token, 21M cap |
| AchievementNFT (FITA) | [`0xc62030e01969c147a2bD3Fe3441de67c75941f92`](https://testnet.snowscan.xyz/address/0xc62030e01969c147a2bD3Fe3441de67c75941f92) | Soulbound ERC-721, non-transferable achievement badges |

### Architecture

```
User checks in
     │
     ▼
Supabase (streak + workout record)
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

**Gasless design**: Only the admin server wallet pays gas. Users never need AVAX. This removes the #1 barrier to Web3 adoption for fitness users.

### Minting Flow
1. User completes a check-in in the app
2. App calls `POST /api/web3/record-habit` with the user's wallet address
3. Admin wallet calls `adminRecordHabitForUser` on HabitRegistry
4. Contract mints 10 $HABIT tokens and triggers NFT at milestone counts
5. User sees a toast: "$HABIT tokens minted to your wallet ✨"

---

## 🪙 Tokenomics — $HABIT

| Parameter | Value |
|-----------|-------|
| Token Name | HABIT |
| Token Symbol | $HABIT |
| Standard | ERC-20 on Avalanche C-Chain |
| Total Supply Cap | **21,000,000 $HABIT** |
| Distribution | 100% via usage rewards (no pre-mine, no VC allocation) |
| Emission Rate | 10 $HABIT per verified daily check-in |
| Minter | HabitRegistry contract only |
| Utility | Future: in-app purchases, coach payments, governance, staking rewards |

### Emission Schedule (Projections)
At 21M cap and 10 tokens/check-in:
- 2,100,000 check-ins to reach full supply
- At 100 daily active users doing 1 check-in/day: ~57 years to cap
- At 10,000 DAU: ~0.6 years to cap → triggers scarcity, demand for existing tokens

### Why This Model Works
- **No inflation risk** — hard cap enforced at contract level
- **No pre-mine** — team earns tokens the same way users do
- **Usage-backed value** — tokens are only created by real human activity
- **Community-first** — largest holders are the most consistent users

---

## 🏅 Achievement NFTs (FITA)

Soulbound (non-transferable) ERC-721 tokens on Avalanche.

| Badge | Trigger | On-chain Type |
|-------|---------|---------------|
| Week Warrior | 7 on-chain check-ins | Type 0 |
| Iron Consistent | 30 on-chain check-ins | Type 1 |
| Century Club | 100 on-chain check-ins | Type 2 |

App-layer milestone badges (claimable in `/achievements`):

| Badge | Threshold |
|-------|-----------|
| Genesis | 1st check-in |
| Iron Will | 7-day streak |
| Three Weeks Strong | 21 check-ins |
| Month Champion | 30-day streak |
| Consistency Legend | 49-day streak |

Badges are **retroactively claimable** — users who built streaks before connecting a wallet can still claim earned milestones.

---

## 🗺️ Roadmap

### ✅ Phase 1 — Core App (Complete)
- [x] Daily check-in with photo upload + IPFS pinning
- [x] Streak tracking with Supabase RPC
- [x] Community feed, likes, comments
- [x] Trainer marketplace + real-time messaging
- [x] Goals and tasks management
- [x] Progress analytics + workout heatmap

### ✅ Phase 2 — Web3 Integration (Complete)
- [x] HabitRegistry, HabitToken, AchievementNFT deployed on Fuji
- [x] Admin wallet minting (zero gas for users)
- [x] In-app self-custodial wallet (no MetaMask required)
- [x] PIN-encrypted cloud key backup + cross-device restore
- [x] Achievements page with Snowscan verification links
- [x] Badge SVG download

### 🔄 Phase 3 — Growth & Mainnet (Q2–Q3 2025)
- [ ] Deploy contracts to Avalanche C-Chain mainnet
- [ ] WalletConnect production project ID
- [ ] $HABIT token listing on DEX (Trader Joe / Pangolin)
- [ ] Push notifications via service worker (workout reminders)
- [ ] Mobile app (React Native / Expo)
- [ ] Coach payment in $HABIT tokens

### 🔮 Phase 4 — Ecosystem (Q4 2025+)
- [ ] Governance: $HABIT holders vote on new badge types and emission rate
- [ ] Staking: stake $HABIT to boost streak multiplier (earn 15 instead of 10)
- [ ] Challenges: group fitness challenges with pooled $HABIT prizes
- [ ] API for third-party fitness app integration
- [ ] Africa-wide expansion beyond Kenya (Uganda, Tanzania, Rwanda)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, App Router |
| Database / Auth | Supabase (PostgreSQL + RLS + Realtime) |
| Smart Contracts | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Web3 Client | wagmi v2, RainbowKit v2, viem |
| In-App Wallet | viem `generatePrivateKey`, AES-GCM 256-bit backup |
| Storage | Supabase Storage (workout photos), Pinata IPFS (metadata) |
| Styling | Tailwind CSS v3, shadcn/ui (Radix UI) |
| State | TanStack Query v5 |
| Testing | Vitest + Testing Library |
| Deployment | Vercel (app), Avalanche Fuji (contracts) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- npm or bun
- Supabase project
- (Optional) WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

### 1. Clone & Install
```bash
git clone https://github.com/mwihoti/daily-habit-hub.git
cd daily-habit-hub
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Web3 (deployed contract addresses)
NEXT_PUBLIC_HABIT_REGISTRY_ADDRESS=0xC578af79b6b727a10505f5aFd288931C75ae37cD
NEXT_PUBLIC_HABIT_TOKEN_ADDRESS=0xF93A86243012c7ABB2B0F2aE0a189614F37aF014
NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=0xc62030e01969c147a2bD3Fe3441de67c75941f92

# Admin wallet for gasless minting (server-only, never expose to client)
PRIVATE_ADMIN_KEY=0xyour_admin_wallet_private_key

# WalletConnect (get free ID at cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# IPFS (optional — Pinata)
PINATA_JWT=your_pinata_jwt
```

### 3. Database Migrations
```bash
# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
npx supabase db push
```

Or run the SQL manually in Supabase SQL Editor — migration files are in `supabase/migrations/`.

### 4. Run Dev Server
```bash
npm run dev
```
Open http://localhost:3000

### 5. Run Tests
```bash
npm run test:run
```

---

## 📦 Smart Contract Deployment

### Compile
```bash
npx hardhat compile
```

### Deploy to Fuji Testnet
```bash
npx hardhat run scripts/deploy.ts --network fuji
```
Copy the deployed addresses into your `.env` file.

### Verify on Snowtrace/Snowscan
```bash
npx hardhat verify --network fuji <CONTRACT_ADDRESS> [constructor args]
```

### Mainnet Migration (Phase 3)
To deploy to Avalanche C-Chain mainnet:
1. Update `hardhat.config.ts` — add `mainnet` network with RPC `https://api.avax.network/ext/bc/C/rpc` and Chain ID `43114`
2. Fund admin wallet with AVAX for gas
3. Run `npx hardhat run scripts/deploy.ts --network mainnet`
4. Update `.env`: replace Fuji addresses with mainnet addresses
5. Update `app/api/web3/record-habit/route.ts`: the `isProduction` flag automatically switches to mainnet chain when `NODE_ENV=production`
6. Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel production env vars

---

## 🗄️ Database Schema

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `profiles` | `id`, `streak`, `total_workouts`, `wallet_address`, `encrypted_wallet_key` | User profile, streak state, wallet |
| `workouts` | `id`, `user_id`, `type`, `note`, `photo_url`, `is_public` | Logged workouts |
| `trainer_profiles` | `user_id`, `bio`, `specialties`, `hourly_rate` | Coach profiles |
| `conversations` | `id`, `user_id`, `trainer_id` | Messaging threads |
| `messages` | `conversation_id`, `sender_id`, `content` | Real-time chat messages |
| `goals` | `user_id`, `title`, `target_date`, `completed` | User fitness goals |
| `tasks` | `user_id`, `title`, `due_date`, `completed` | Daily workout tasks |
| `community_posts` | — | (via workouts with `is_public=true`) |
| `user_achievements` | `user_id`, `milestone`, `claimed_at` | Claimed NFT milestone badges |

### Key Database Functions
- `record_checkin(p_user_id)` — atomic streak update (handles consecutive-day logic, resets on missed day)

---

## 🔐 Security

- **Admin private key** (`PRIVATE_ADMIN_KEY`) is server-only — never exposed to the client
- **User wallet keys** never leave the browser — only the public address is stored in Supabase
- **Cloud backup keys** are AES-GCM 256-bit encrypted with PBKDF2 (100k iterations) before upload — the PIN is never stored
- **RLS (Row Level Security)** enforced on all Supabase tables
- **Auth** via Supabase Auth (email/password + Google OAuth) with server-side session validation
- **Contract access control** — `adminRecordHabitForUser` is `onlyOwner`, NFT minting is `minter`-gated

---

## 🌍 Market & Traction

**Target market:** Kenya (primary), East Africa (expansion)
- Kenya has 54M population, ~40% smartphone penetration and rapidly growing
- Fitness app market in Sub-Saharan Africa projected to grow 15% YoY
- Crypto adoption in Kenya ranks among the highest in Africa (Chainalysis 2023)

**Why Web3 works here:**
- Users are already familiar with mobile money (M-Pesa) — digital value transfer is second nature
- $HABIT tokens create tangible financial incentive for consistency
- NFT badges provide social proof and community status

---

## 📄 License

Private — Daily Habit Hub © 2025. All rights reserved.

---

## 📬 Contact

- **GitHub**: [github.com/mwihoti/daily-habit-hub](https://github.com/mwihoti/daily-habit-hub)
- **Live App**: [daily-habit-hub.vercel.app](https://daily-habit-hub.vercel.app)
- **Contracts (Fuji)**: See [Smart Contracts](#smart-contracts-fuji-testnet) section above
