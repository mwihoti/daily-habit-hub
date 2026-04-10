# Daily Habit Hub — Pitch & Strategy

**Build exercise habits. Earn crypto. Prove your consistency on-chain.**

Live App: https://daily-habit-hub.vercel.app

---

## The Problem

Fitness apps have a retention problem. Most people quit within 30 days because there is no real cost to stopping and no tangible reward for continuing. Traditional social features — likes, streaks, badges — are forgettable.

In Kenya and East Africa, this problem is compounded:
- No dominant fitness app built for local context
- Personal trainers earn inconsistently through WhatsApp referrals
- Crypto adoption is among the highest in Africa yet no fitness app taps into it

---

## The Solution

Daily Habit Hub rewards consistency with assets users actually own:
- **$HABIT tokens** — 10 ERC-20 tokens minted per verified daily check-in
- **Soulbound NFT badges** — non-transferable achievement proof at 7, 30, 100 on-chain check-ins
- **Zero gas fees** — admin wallet pays all gas, users never need AVAX
- **No MetaMask required** — one-click in-app wallet with PIN-encrypted cloud backup

---

## Target Users

### Primary — The Nairobi Hustler
Age 22–35, income KES 30K–120K/month, based in Nairobi (Kilimani, Westlands, Kasarani, Thika Road).

- Already works out but lacks accountability
- Familiar with M-Pesa — digital rewards feel natural
- Crypto-curious but not crypto-native
- Responds to streaks, leaderboards, and tangible rewards

**Why they stay:** Quitting means leaving $HABIT tokens on the table.

### Secondary Segments

| Segment | Profile | Value |
|---|---|---|
| Kenyan Fitness Trainers | Mid-tier gym PTs, independent coaches | Marketplace revenue, retention driver |
| Diaspora (UK/US/CA) | Kenyans abroad, higher crypto literacy | Token demand, premium revenue, word of mouth |
| Campus Athletes | UoN, Strathmore, USIU students | Viral growth engine, future core users |
| Corporate Employees | Safaricom, KCB, tech companies | B2B contracts, low churn |

### Who Is Not the User Yet
Rural Kenya (smartphone penetration too low), serious athletes (use Garmin/Strava), pure crypto traders (want speculation not discipline).

---

## Value Acquisition & Monetization

### Revenue Streams

**1. Trainer Marketplace Commission**
10–15% on every coaching session booked. Trainers list sessions priced in KES or $HABIT.
- 100 trainers × 10 sessions/month × $20 average = ~$20K/month at early scale

**2. Premium Subscription**
- Free tier: 10 $HABIT per check-in
- Premium ($5/month or stake 500 $HABIT): 15 $HABIT per check-in, advanced analytics, nutrition log
- Creates buy pressure — users must acquire $HABIT to unlock multipliers

**3. Corporate Wellness B2B**
Companies pay per-seat monthly fees. HR dashboard shows team streak health.
Target: Safaricom, KCB, NCBA, Andela, Cellulant.
Recurring, predictable revenue with no token dependency.

**4. Sponsored Challenges**
Brands (Nike Kenya, supplement companies, gyms) pay to create 30-day branded challenges.
Winners split a pooled $HABIT prize. Protocol takes a setup fee.

### Token Value Loop

```
User checks in daily
  → earns $HABIT
  → stakes $HABIT for reward multiplier   (locks supply)
  → pays trainer in $HABIT                (real utility)
  → trainer converts portion to AVAX      (cross-token flow)
  → more users join to earn               (demand rises)
  → early holders benefit                 (community-aligned incentives)
```

Hard cap of 21M $HABIT enforced at contract level. At 10,000 DAU the cap is hit in under a year — after that, all utility demand goes to secondary market.

---

## Value to the Avalanche Ecosystem

| Contribution | Why It Matters |
|---|---|
| Real daily on-chain transactions | Every check-in = 1 tx → network fees, activity metrics |
| Non-speculative new wallets | Fitness users are not crypto-native — expands the AVAX user base |
| Gasless onboarding pattern | Proves admin-wallet UX works; replicable by other builders |
| $HABIT token liquidity | Future DEX listing (Trader Joe / Pangolin) adds TVL and volume |
| Soulbound NFT use case | Demonstrates non-financial NFT utility |
| Sub-Saharan Africa market | Region Avalanche has not cracked — strategic for ecosystem grants |

---

## Why Kenya

- 54M population, ~40% smartphone penetration and growing fast
- M-Pesa familiarity — Kenyans are already comfortable with mobile digital value transfer
- Kenya ranks top 5 globally in grassroots crypto usage (Chainalysis 2023)
- No incumbent fitness app with Web3 rewards — first-mover advantage is real
- Fitness trainer income is broken — your marketplace solves a real livelihood problem

---

## Traction & Product Status

### Phase 1 — Core App (Complete)
- Daily check-in with photo upload and IPFS pinning
- Streak tracking via Supabase RPC (atomic, cheat-proof)
- Community feed with likes and comments
- Trainer marketplace with real-time messaging
- Goals and tasks management
- Progress analytics and workout heatmap

### Phase 2 — Web3 Integration (Complete)
- HabitRegistry, HabitToken ($HABIT), AchievementNFT deployed on Avalanche Fuji
- Admin wallet gasless minting — zero AVAX cost to users
- In-app self-custodial wallet (no MetaMask required)
- PIN-encrypted cloud key backup with cross-device restore
- Achievement badges with Snowscan verification
- SVG badge download
- Leaderboard (top 50 by streak, live)

### Phase 3 — Growth & Mainnet (Q2–Q3 2026)
- Deploy contracts to Avalanche C-Chain mainnet
- $HABIT DEX listing (Trader Joe / Pangolin)
- Push notifications — workout reminders
- Mobile app (React Native / Expo)
- Coach payment in $HABIT tokens
- Premium subscription tier

### Phase 4 — Ecosystem (Q4 2026+)
- Governance: $HABIT holders vote on badge types and emission rate
- Staking: stake $HABIT to boost streak multiplier
- Group challenges with pooled $HABIT prizes
- API for third-party fitness app integration
- East Africa expansion: Uganda, Tanzania, Rwanda

---

## Smart Contracts (Avalanche Fuji Testnet)

| Contract | Address |
|---|---|
| HabitRegistry | `0xC578af79b6b727a10505f5aFd288931C75ae37cD` |
| HabitToken ($HABIT) | `0xF93A86243012c7ABB2B0F2aE0a189614F37aF014` |
| AchievementNFT (FITA) | `0xc62030e01969c147a2bD3Fe3441de67c75941f92` |

---

## Tokenomics — $HABIT

| Parameter | Value |
|---|---|
| Standard | ERC-20 on Avalanche C-Chain |
| Total Supply Cap | 21,000,000 $HABIT |
| Distribution | 100% via usage rewards — no pre-mine, no VC allocation |
| Emission Rate | 10 $HABIT per verified daily check-in |
| Minter | HabitRegistry contract only |
| Utility | Trainer payments, premium tier, staking, governance |

**No pre-mine. No VC allocation. The team earns tokens the same way users do.**

---

## Achievement NFTs (FITA)

Soulbound ERC-721 — non-transferable, permanently tied to the earning wallet.

| Badge | Trigger | On-chain |
|---|---|---|
| Week Warrior | 7 on-chain check-ins | Auto-minted by contract |
| Iron Consistent | 30 on-chain check-ins | Auto-minted by contract |
| Century Club | 100 on-chain check-ins | Auto-minted by contract |
| Genesis Badge | 1st check-in | App-layer (Supabase) |
| Three Weeks Strong | 21 check-ins | App-layer (Supabase) |
| Consistency Legend | 49-day streak | App-layer (Supabase) |

Retroactive claiming supported — users who built streaks before connecting a wallet can still claim.

---

## Acquisition Channels

| Segment | Channel |
|---|---|
| Nairobi Hustler | TikTok/Instagram fitness content, gym partnerships, streak challenges |
| Trainers | Direct outreach at gyms, trainer WhatsApp groups, referral bonus |
| Diaspora | Twitter/X Kenyan community, Facebook groups |
| Campus | Student reps program, inter-hall streak competitions |
| Corporate | LinkedIn, cold email to HR managers, anchor company pilot |

---

## Grant Pitch (One Paragraph)

Daily Habit Hub is the first fitness-to-earn app built natively on Avalanche with a fully gasless UX, targeting Kenya's 54M population where no Web3 fitness competitor exists. Every daily active user generates on-chain transactions, $HABIT token velocity, and a new permanent wallet on the Avalanche network. We have a working product live at daily-habit-hub.vercel.app with smart contracts deployed on Fuji, a trainer marketplace, community features, and a tokenomics model with a hard-capped supply and zero pre-mine. We are seeking ecosystem grant support to deploy to mainnet, list $HABIT on a DEX, and launch in Nairobi with an initial cohort of 500 users and 50 certified trainers.

---

## Contact

- GitHub: [github.com/mwihoti/daily-habit-hub](https://github.com/mwihoti/daily-habit-hub)
- Live App: [daily-habit-hub.vercel.app](https://daily-habit-hub.vercel.app)
- Builder: [@mwihoti](https://github.com/mwihoti)
