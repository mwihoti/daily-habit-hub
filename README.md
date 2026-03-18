# 🔥 Daily Habit Hub

**Build exercise habits through daily accountability, community support, and affordable coaching.**

Daily Habit Hub is a modern fitness tracking application designed to help users stay consistent with their exercise routines. Built with a focus on community and progress, it combines social accountability with cutting-edge Web3 rewards.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)](https://www.avax.network/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

### ✅ Daily Check-ins
Easily log your workouts with a single tap. Support for various activities including:
- 🏋️ Gym
- 🏃 Run/Walk
- 🏠 Home Workout
- 🚴 Cycling
- 🧘 Yoga/Stretch

### 🔥 Streak Tracking
Stay motivated with visual streak badges and a weekly activity calendar. Never break the chain!

### 👥 Community Support
Connect with friends and the wider community. See others working out in real-world time to stay inspired.

### 🎯 Professional Coaching
Find and connect with certified trainers to take your fitness journey to the next level.

### ⛓️ Web3 Rewards (Avalanche)
Connect your wallet to:
- Earn **$HABIT tokens** for your consistency.
- Mint **"Proof of Progress"** on the Avalanche network.
- Record your fitness journey permanently on-chain.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Web3**: [Wagmi](https://wagmi.sh/), [RainbowKit](https://www.rainbowkit.com/), [viem](https://viem.sh/) (Avalanche)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or bun

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd daily-habit-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase and WalletConnect credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🗄️ Database Schema

The project uses Supabase as its primary database. Key tables include:

- `profiles`: User information, streak data, and wallet addresses.
- `workouts`: Logged physical activities with notes and proof photos.
- `trainers`: Profiles for certified fitness coaches.

---

## 🇰🇪 Built for Consistency

Originally inspired to help fitness enthusiasts in Kenya build lasting habits, Daily Habit Hub is designed for anyone who wants to turn "someday" into "today".

---

live app: https://daily-habit-hub.vercel.app/
---

## 📄 License

This project is private and intended for the Daily Habit Hub startup.
