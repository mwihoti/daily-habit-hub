# Daily Habit Hub — Pitch & Strategy

**Show up every day. Earn crypto. Build a fitness record no one can fake.**

Live App: https://daily-habit-hub.vercel.app

---

## The Problem

Most people quit fitness apps within 30 days. Not because they stop caring — but because there is nothing real at stake. Likes disappear. Streaks reset. Badges mean nothing outside the app.

In Kenya this hits differently. Personal trainers are talented but survive on WhatsApp referrals and inconsistent cash payments. Gym-goers want accountability but have no community that keeps them showing up. Meanwhile Kenya is one of the most crypto-active countries in the world, yet not a single fitness app has touched that.

We think that's a big missed opportunity.

---

## What We Built

Daily Habit Hub is a fitness accountability app where your consistency lives on the blockchain. Every time you check in, you earn $HABIT tokens and — at milestones — soulbound NFT badges that are permanently tied to your wallet. You can't fake them, transfer them, or buy them. You can only earn them by showing up.

What makes it actually usable:
- **Zero gas fees** — we cover all transaction costs. Users never touch AVAX.
- **No MetaMask, no seed phrases** — one tap creates an in-app wallet with PIN-encrypted cloud backup.
- **Real community** — leaderboard, public workout feed, likes, comments, trainer marketplace with live chat.

If you quit, you leave tokens on the table. That's the hook.

---

## Who It's For

### The Nairobi Hustler
22–35 years old. Earns KES 30K–120K/month. Already working out but struggling to stay consistent. Grew up on M-Pesa — digital rewards make sense. Crypto-curious but not deep in it. Responds to competition, streaks, and anything that feels like a win.

### Also Built For

| Who | Why They Care |
|---|---|
| Independent fitness trainers | Get paid in $HABIT, build a client base through the marketplace |
| Kenyan diaspora (UK/US/CA) | Higher crypto literacy, drive token demand and referrals |
| Campus athletes (UoN, Strathmore, USIU) | Viral streak competitions between halls and courses |
| Corporate HR teams | Team wellness dashboards, employee accountability, B2B contracts |

---

## How We Make Money

**Trainer marketplace** — we take 10–15% on every session booked. At 100 active trainers doing 10 sessions/month at $20 average, that's ~$20K/month.

**Premium tier** — free users earn 10 $HABIT/check-in. Premium ($5/month or stake 500 $HABIT) earns 15, unlocks advanced analytics and a nutrition log. Staking locks supply, creating buy pressure.

**Corporate wellness** — per-seat monthly contracts with companies like Safaricom, KCB, Andela. Recurring revenue with no token dependency.

**Sponsored challenges** — brands pay to run 30-day challenges. Winners split a pooled $HABIT prize. We take a setup fee.

### The Token Loop

```
You check in → earn $HABIT
  → stake to boost rewards       (supply locks)
  → pay your trainer in $HABIT   (real utility)
  → trainer converts some to AVAX (cross-token flow)
  → new users join to earn        (demand grows)
  → early consistent users win    (community-aligned)
```

Hard cap: 21 million $HABIT. No pre-mine. The team earns tokens the same way users do — by showing up.

---

## Why This Matters for Avalanche

Kenya is a market Avalanche hasn't cracked yet. We're building the entry point.

Every daily active user on Daily Habit Hub generates a real on-chain transaction, a new Avalanche wallet, and genuine $HABIT token velocity. These aren't speculators. They're gym-goers who don't even know they're using a blockchain. That's the kind of organic adoption that makes an ecosystem grow.

- 54M population, ~40% smartphone penetration and rising fast
- Top 5 globally in grassroots crypto adoption (Chainalysis 2023)
- M-Pesa-native — digital value transfer is second nature here
- No Web3 fitness competitor in the market
- Our gasless onboarding pattern is replicable by any Avalanche builder

---

## Where We Are

**Done:**
- Full web app live at daily-habit-hub.vercel.app
- Daily check-in with IPFS photo pinning
- Cheat-proof streak tracking
- Community feed, leaderboard (top 50, live)
- Trainer marketplace with real-time messaging
- In-app self-custodial wallet, PIN backup, cross-device restore
- HabitRegistry, HabitToken ($HABIT), AchievementNFT — all deployed on Avalanche C-Chain mainnet
- Soulbound NFT badges verified on Snowscan

**Next with grant support:**
- Grassroots marketing in Nairobi — gym partnerships, trainer onboarding, streak challenges
- List $HABIT on Trader Joe / Pangolin
- Mobile app (React Native / Expo)
- Push notification workout reminders
- Coach payments in $HABIT

**Later:**
- $HABIT governance and staking
- Group challenges with pooled prizes
- East Africa expansion — Uganda, Tanzania, Rwanda

---

## Smart Contracts (Avalanche C-Chain Mainnet)

| Contract | Address |
|---|---|
| HabitRegistry | `0xAb9d332EDeEAB63fc84B72dB7B48Ff81962A6597` |
| HabitToken ($HABIT) | `0xf392A21a7230a103271ecb88028aDE17B470A267` |
| AchievementNFT (FITA) | `0xc10e391172fE5E6723422F05197bBc95b35D9188` |

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

## Grant Pitch

We started Daily Habit Hub because we watched talented trainers in Nairobi struggle to find clients and watched motivated people quit their fitness goals because no app gave them a real reason to stay. We built the product we wished existed — one where showing up every day actually means something, where your consistency is provable and rewarded with assets you own.

The app is live. The contracts are on mainnet. The community is starting to form. What we need now is fuel — to get into Nairobi gyms, onboard the first wave of trainers, and show the Avalanche ecosystem what real grassroots Web3 adoption looks like from East Africa.

---

## Contact

- GitHub: [github.com/mwihoti/daily-habit-hub](https://github.com/mwihoti/daily-habit-hub)
- Live App: [daily-habit-hub.vercel.app](https://daily-habit-hub.vercel.app)
- Builder: [@mwihoti](https://github.com/mwihoti)
