'use client';
export const dynamic = 'force-dynamic';

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StreakBadge, WeekCalendar, WorkoutHeatmap } from "@/components/StreakComponents";
import {
  TrendingUp, TrendingDown, Minus, Calendar,
  Flame, Target, BarChart3, Trophy, Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, eachMonthOfInterval, isSameMonth, startOfWeek, isSameDay } from "date-fns";
import { useState, useEffect } from "react";
import { useEmbeddedWallet } from "@/hooks/useEmbeddedWallet";
import { ACHIEVEMENT_NFT_ADDRESS, ACHIEVEMENTS } from "@/lib/web3/habitRegistry";

const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
// keccak256("hasAchievement(address,uint8)").slice(0,4) = 0x45fd14b0
const HAS_ACHIEVEMENT_SELECTOR = '45fd14b0';

export default function ProgressPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const supabase = createClient();
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Use unified wallet hook — works for both embedded and external wallets
  const { activeAddress } = useEmbeddedWallet(user?.id);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      return data;
    }
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  // On-chain achievement status — raw eth_call, no wagmi/viem generics
  const { data: onChainAchievements } = useQuery({
    queryKey: ['achievements', activeAddress],
    enabled: !!activeAddress && isMounted,
    queryFn: async (): Promise<boolean[]> => {
      const addr = (activeAddress as string).replace('0x', '').toLowerCase().padStart(64, '0');
      const results = await Promise.all(
        ACHIEVEMENTS.map(async (a) => {
          const typeHex = a.type.toString(16).padStart(64, '0');
          const data = HAS_ACHIEVEMENT_SELECTOR + addr + typeHex;
          try {
            const res = await fetch(FUJI_RPC, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: ACHIEVEMENT_NFT_ADDRESS, data }, 'latest'] }),
            });
            const json = await res.json() as { result?: string };
            return json.result !== undefined && json.result !== '0x' && json.result !== '0x' + '0'.repeat(64) && parseInt(json.result, 16) === 1;
          } catch {
            return false;
          }
        })
      );
      return results;
    },
  });

  // Calculate monthly data for the last 6 months
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyWorkouts = months.map(month => {
    const count = workouts.filter(w => isSameMonth(new Date(w.created_at), month)).length;
    return {
      month: format(month, "MMM"),
      workouts: count
    };
  });

  const maxWorkouts = Math.max(...monthlyWorkouts.map(d => d.workouts), 1);
  const totalWorkouts = workouts.length;
  const avgWorkoutsPerMonth = Math.round((totalWorkouts / Math.max(1, monthlyWorkouts.length)) * 10) / 10;

  // This week's data
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyWorkoutCount = workouts.filter(w => new Date(w.created_at) >= startOfThisWeek).length;
  const checkedDays = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
    const date = new Date(startOfThisWeek);
    date.setDate(date.getDate() + dayIndex);
    return workouts.some(w => isSameDay(new Date(w.created_at), date));
  });

  const milestones = [
    { title: "First Step", description: "Complete 1 workout", achieved: totalWorkouts >= 1, emoji: "🌱" },
    { title: "Getting Stronger", description: "10 total workouts", achieved: totalWorkouts >= 10, emoji: "💪" },
    { title: "Consistency", description: "7 day streak", achieved: (profile?.streak || 0) >= 7, emoji: "👑" },
    { title: "Century Club", description: "100 total workouts", achieved: totalWorkouts >= 100, emoji: "🏆" },
  ];

  const metrics = [
    { 
      label: "Total Workouts", 
      current: totalWorkouts, 
      change: `+${monthlyWorkouts[5].workouts} this month`, 
      trend: "up" as const,
      icon: Trophy,
    },
    { 
      label: "Avg Workouts/Month", 
      current: avgWorkoutsPerMonth, 
      change: "Stable", 
      trend: "up" as const,
      icon: BarChart3,
    },
    { 
      label: "Best Streak", 
      current: `${profile?.streak || 0} days`, 
      change: "Keep it up!", 
      trend: "up" as const,
      icon: Flame,
    },
  ];

  return (
    <Layout>
      <div className="container py-6 md:py-12">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-display font-bold mb-2">Your Progress 📈</h1>
          <p className="text-muted-foreground">
            Celebrating consistency over perfection. Every workout counts!
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <Card key={metric.label} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                    metric.trend === "up" ? "bg-primary/10 text-primary" :
                    metric.trend === "down" ? "bg-secondary/10 text-secondary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {metric.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                     metric.trend === "down" ? <TrendingDown className="w-3 h-3" /> :
                     <Minus className="w-3 h-3" />}
                    {metric.change}
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{metric.current}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Last 6 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-4">
                {monthlyWorkouts.map((data, index) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold">{data.workouts}</span>
                    <div 
                      className="w-full rounded-t-xl gradient-hero transition-all duration-500"
                      style={{ 
                        height: `${(data.workouts / maxWorkouts) * 100}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-muted flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Journey</p>
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Journey Start</p>
                  <p className="text-2xl font-bold">
                    {user?.created_at ? format(new Date(user.created_at), "MMM yyyy") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <StreakBadge streak={profile?.streak || 0} size="lg" />
              </div>
              <WeekCalendar checkedDays={checkedDays} />
              <div className="text-center p-4 rounded-xl bg-primary/10">
                <p className="text-sm text-muted-foreground">Weekly Progress</p>
                <p className="text-xl font-bold text-primary">{weeklyWorkoutCount}/7 Days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Heatmap */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Workout History — Last 16 Weeks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutHeatmap
              workoutDates={workouts.map((w: any) => w.created_at)}
              weeksBack={16}
            />
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {milestones.map((milestone) => (
                <div
                  key={milestone.title}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    milestone.achieved
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/50 opacity-60"
                  )}
                >
                  <div className="text-3xl mb-2">{milestone.emoji}</div>
                  <h3 className="font-bold mb-1">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  {milestone.achieved && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      ✓ Achieved
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* On-chain NFT Achievements */}
        <Card className="mt-6 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-accent" />
              On-Chain NFT Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activeAddress ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Set up a wallet on the check-in page to earn soulbound NFT badges on Avalanche.
              </p>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {ACHIEVEMENTS.map((achievement, i) => {
                  const earned = onChainAchievements?.[i] === true;
                  return (
                    <div
                      key={achievement.type}
                      className={cn(
                        "p-5 rounded-2xl border-2 text-center transition-all",
                        earned
                          ? "border-yellow-400/40 bg-yellow-400/5 shadow-sm"
                          : "border-border bg-muted/30 opacity-50"
                      )}
                    >
                      <div className={cn("text-5xl mb-3", !earned && "grayscale")}>{achievement.emoji}</div>
                      <h3 className="font-display font-bold text-sm mb-1">{achievement.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                      {earned ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold">
                          Minted
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                          Locked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
