'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { StreakBadge, StatCard, WeekCalendar } from "@/components/StreakComponents";
import {
  ArrowRight, Users, CheckCircle, Trophy, Flame, Target, Heart,
  Coins, Shield, Zap, ExternalLink, Globe,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek, isSameDay } from "date-fns";

// ── Static content ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: CheckCircle,
    title: "Daily Check-ins",
    description: "One tap to log your workout. Every check-in earns 10 $HABIT tokens automatically.",
    emoji: "✅",
  },
  {
    icon: Users,
    title: "Community Feed",
    description: "See friends working out in real time. Stay accountable together.",
    emoji: "👥",
  },
  {
    icon: Flame,
    title: "Streak Tracking",
    description: "Build unstoppable momentum. NFT badges unlock at 7, 21, 30 and 49-day streaks.",
    emoji: "🔥",
  },
  {
    icon: Target,
    title: "Find a Coach",
    description: "Affordable online coaching from certified trainers. Message them directly.",
    emoji: "🎯",
  },
];

const web3Features = [
  {
    emoji: "🪙",
    title: "Earn $HABIT Tokens",
    description: "10 $HABIT minted to your wallet every check-in. 21 million token cap on Avalanche.",
  },
  {
    emoji: "🏅",
    title: "Soulbound NFT Badges",
    description: "Milestone badges (7d, 21d, 30d, 49d) are non-transferable — they prove your real effort.",
  },
  {
    emoji: "⛽",
    title: "Zero Gas Fees",
    description: "We cover all transaction costs via our admin wallet. You just check in — we handle the chain.",
  },
  {
    emoji: "🔐",
    title: "Self-Custodial Wallet",
    description: "Create an in-app wallet in one click. No MetaMask needed. Export your key anytime.",
  },
  {
    emoji: "☁️",
    title: "Encrypted Cloud Backup",
    description: "Your wallet key is PIN-encrypted and synced to the cloud. Restore it on any device.",
  },
  {
    emoji: "🔍",
    title: "Verified On-Chain",
    description: "Every achievement is visible on Snowscan. Your consistency is permanently provable.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Nairobi",
    text: "Finally found something that keeps me consistent! The community is so supportive.",
    streak: 45,
    avatar: "🏃‍♀️",
  },
  {
    name: "James K.",
    location: "Mombasa",
    text: "My coach helped me lose 10kg in 3 months. And I earned $HABIT tokens doing it!",
    streak: 89,
    avatar: "💪",
  },
  {
    name: "Mary W.",
    location: "Kisumu",
    text: "I've never been this consistent. The NFT badges make it feel real — not just another app.",
    streak: 32,
    avatar: "🧘‍♀️",
  },
];

const CONTRACT_ADDRESSES = {
  HabitRegistry:   "0xAb9d332EDeEAB63fc84B72dB7B48Ff81962A6597",
  HabitToken:      "0xf392A21a7230a103271ecb88028aDE17B470A267",
  AchievementNFT:  "0xc10e391172fE5E6723422F05197bBc95b35D9188",
};
const SNOWSCAN = "https://snowscan.xyz";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const supabase = createClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      return data;
    },
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('workouts').select('*').eq('user_id', user?.id);
      return data || [];
    },
  });

  // Live platform stats (visible to non-logged-in users)
  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    enabled: !user,
    queryFn: async () => {
      const [usersRes, workoutsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('workouts').select('id', { count: 'exact', head: true }),
      ]);
      return {
        users: usersRes.count ?? 0,
        checkIns: workoutsRes.count ?? 0,
        tokensEarned: (workoutsRes.count ?? 0) * 10,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const checkedDays = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const d = new Date(startOfThisWeek);
    d.setDate(d.getDate() + i);
    return workouts.some((w: any) => isSameDay(new Date(w.created_at), d));
  });
  const weeklyWorkoutCount = workouts.filter((w: any) => new Date(w.created_at) >= startOfThisWeek).length;

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5 pointer-events-none" />
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">

            {/* Avalanche badge */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs">
                <span>🔺</span> Powered by Avalanche
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-xs">
                <span>🇰🇪</span>
                {user
                  ? `Welcome back, ${profile?.full_name?.split(' ')[0] || 'Warrior'}`
                  : 'Built for Kenya, made for everyone'}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {user ? (
                <>You've done <span className="text-gradient">{workouts.length}</span> workouts. Keep it up!</>
              ) : (
                <>Show up. Stay consistent. <span className="text-gradient">Earn crypto.</span></>
              )}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {user
                ? 'Your journey is in progress. Check in today to keep your streak alive and earn $HABIT tokens!'
                : 'The fitness app that rewards your consistency. Every workout earns $HABIT tokens and soulbound NFT badges on Avalanche — zero gas fees required.'}
            </p>

            {/* Token highlight pills */}
            {!user && (
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                  🪙 10 $HABIT per check-in
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                  🏅 Soulbound NFT milestones
                </span>
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold border border-green-500/20">
                  ⛽ Zero gas fees
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              {user ? (
                <Button variant="hero" size="xl" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <Button variant="hero" size="xl" asChild>
                  <Link href="/register">
                    Start Earning Free <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="xl" asChild>
                <Link href="/community">
                  <Users className="w-5 h-5" /> View Community
                </Link>
              </Button>
            </div>

            {!user && (
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" /> Free forever
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" /> Self-custodial wallet
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" /> No MetaMask needed
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="py-8 border-y bg-muted/20">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {user ? (
              <>
                <StatCard label="Your Day Streak" value={(profile?.streak || 0).toString()} icon={Flame} trend="Keep it burning! 🔥" />
                <StatCard label="Your Workouts"   value={workouts.length.toString()} icon={CheckCircle} trend="Great consistency!" />
                <StatCard label="$HABIT Earned"   value={(workouts.length * 10).toString()} icon={Coins} trend="10 per check-in" />
              </>
            ) : (
              <>
                <StatCard label="Registered users"    value={platformStats ? platformStats.users.toLocaleString() : "—"}       icon={Users}        trend="Growing daily" />
                <StatCard label="Total check-ins"     value={platformStats ? platformStats.checkIns.toLocaleString() : "—"}    icon={CheckCircle}  trend="Live count" />
                <StatCard label="$HABIT tokens minted" value={platformStats ? platformStats.tokensEarned.toLocaleString() : "—"} icon={Coins}        trend="10 per check-in" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── App Features ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to <span className="text-gradient">stay consistent</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple tools that work. No gimmicks, just results — and crypto rewards.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="card-hover group">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {f.emoji}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                    <p className="text-muted-foreground text-sm">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Web3 / Avalanche Section ── */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm mx-auto">
              🔺 Built on Avalanche
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Your fitness. <span className="text-gradient">On the blockchain.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every check-in is recorded on Avalanche. Every milestone earns a soulbound NFT.
              Your consistency is permanently and publicly provable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {web3Features.map((f) => (
              <Card key={f.title} className="card-hover border-primary/10">
                <CardContent className="p-6 flex gap-4">
                  <div className="text-3xl shrink-0">{f.emoji}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Deployed contract addresses */}
          <Card className="max-w-3xl mx-auto border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Live Contracts — Avalanche C-Chain Mainnet
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(CONTRACT_ADDRESSES).map(([name, addr]) => (
                  <div key={name} className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm font-semibold">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground hidden sm:block">
                        {addr.slice(0, 10)}...{addr.slice(-8)}
                      </span>
                      <a
                        href={`${SNOWSCAN}/address/${addr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                      >
                        Snowscan <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Streak Demo ── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <StreakBadge streak={user ? (profile?.streak || 0) : 15} size="lg" />
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {user ? 'Your Weekly Activity' : 'Build your streak'}
                      </h3>
                      <p className="text-muted-foreground">
                        {user
                          ? `You've checked in ${weeklyWorkoutCount} out of 7 days this week. Don't break the chain!`
                          : 'Every daily check-in earns 10 $HABIT tokens and brings you closer to the next NFT badge milestone.'}
                      </p>
                    </div>
                    <Button variant="hero" asChild>
                      <Link href={user ? "/check-in" : "/register"}>
                        {user ? 'Check In Today' : 'Start Earning'}
                        <Flame className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <WeekCalendar checkedDays={user ? checkedDays : [true, true, true, false, true, true, true]} />
                    <p className="text-sm text-muted-foreground text-center">
                      {user ? `${weeklyWorkoutCount} out of 7 days this week 🎯` : '6 out of 7 days this week 🎯'}
                    </p>
                    {!user && (
                      <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                          60 $HABIT earned this week
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {!user && (
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Real people. Real results.</h2>
              <p className="text-muted-foreground text-lg">
                Join the community building better habits across Kenya
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.name} className="card-hover">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.location}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{t.text}</p>
                    <div className="flex items-center justify-between">
                      <StreakBadge streak={t.streak} size="sm" />
                      <span className="text-xs text-amber-600 font-semibold">
                        {t.streak * 10} $HABIT earned
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-energy opacity-5 pointer-events-none" />
        <div className="container relative">
          <Card className="max-w-3xl mx-auto overflow-hidden shadow-glow border-primary/20">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  {user ? 'Keep your momentum going!' : 'Ready to get fit and earn crypto?'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {user
                    ? 'Your next workout is waiting. Show up for yourself today.'
                    : 'Start free. No MetaMask. No gas fees. Your consistency earns real tokens on Avalanche.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button variant="hero" size="xl" asChild>
                    <Link href="/check-in">
                      Log Today's Workout <CheckCircle className="w-5 h-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="hero" size="xl" asChild>
                    <Link href="/register">
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="xl" asChild>
                  <Link href={user ? '/achievements' : '/trainers'}>
                    <Trophy className="w-5 h-5" />
                    {user ? 'View Achievements' : 'Find a Trainer'}
                  </Link>
                </Button>
              </div>
              {!user && (
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-primary text-primary" /> No credit card
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary" /> Wallet created in 1 click
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" /> Your keys, your tokens
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
