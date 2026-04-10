'use client';

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Flame, Star, Crown, ShieldCheck, Sparkles, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Milestone definitions ─────────────────────────────────────────────────────

type MilestoneId = 'genesis' | 'iron_will' | 'three_weeks' | 'month_champion' | 'consistency_legend';

interface Milestone {
  id: MilestoneId;
  title: string;
  description: string;
  unlockLabel: string;
  threshold: number;
  thresholdType: 'workouts' | 'streak';
  icon: React.ElementType;
  color: string;
  bg: string;
  borderColor: string;
  onChainNote?: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'genesis',
    title: 'Genesis Badge',
    description: 'You showed up. That first step is the hardest — and you did it.',
    unlockLabel: '1 Check-in',
    threshold: 1,
    thresholdType: 'workouts',
    icon: Star,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'iron_will',
    title: 'Iron Will',
    description: 'Seven days of showing up. Habits are officially forming.',
    unlockLabel: '7-Day Streak',
    threshold: 7,
    thresholdType: 'streak',
    icon: ShieldCheck,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    onChainNote: 'NFT auto-minted after 7 on-chain check-ins',
  },
  {
    id: 'three_weeks',
    title: 'Three Weeks Strong',
    description: 'Science says 21 days builds a habit. You\'ve proven it.',
    unlockLabel: '21 Check-ins',
    threshold: 21,
    thresholdType: 'workouts',
    icon: Flame,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'month_champion',
    title: 'Month Champion',
    description: 'A full month of commitment. You are the definition of consistency.',
    unlockLabel: '30-Day Streak',
    threshold: 30,
    thresholdType: 'streak',
    icon: Trophy,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    onChainNote: 'NFT auto-minted after 30 on-chain check-ins',
  },
  {
    id: 'consistency_legend',
    title: 'Consistency Legend',
    description: '7 consecutive weeks — this is no longer just a habit. It\'s who you are.',
    unlockLabel: '49-Day Streak',
    threshold: 49,
    thresholdType: 'streak',
    icon: Crown,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState<MilestoneId | null>(null);

  // Fetch authenticated user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch real profile stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['achievement-stats', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('streak, total_workouts')
        .eq('id', user!.id)
        .single();
      return {
        currentStreak: data?.streak ?? 0,
        totalWorkouts: data?.total_workouts ?? 0,
      };
    },
  });

  // Fetch claimed achievements from DB
  const { data: claimedMap = {} } = useQuery({
    queryKey: ['user-achievements', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select('milestone, claimed_at, is_on_chain, tx_hash')
        .eq('user_id', user!.id);
      const map: Record<string, { claimedAt: string; isOnChain: boolean; txHash?: string }> = {};
      for (const row of (data ?? [])) {
        if (row.claimed_at) {
          map[row.milestone] = {
            claimedAt: row.claimed_at,
            isOnChain: row.is_on_chain,
            txHash: row.tx_hash ?? undefined,
          };
        }
      }
      return map;
    },
  });

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: async (milestone: MilestoneId) => {
      const res = await fetch('/api/web3/claim-achievement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Claim failed');
      return json;
    },
    onSuccess: (data) => {
      toast.success(`${data.label} claimed! Your NFT badge has been recorded.`, { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
    onSettled: () => setClaiming(null),
  });

  const handleClaim = (milestoneId: MilestoneId) => {
    setClaiming(milestoneId);
    claimMutation.mutate(milestoneId);
  };

  const isLoading = statsLoading || !stats;

  const earnedCount = isLoading ? 0 : MILESTONES.filter((m) => {
    const val = m.thresholdType === 'streak'
      ? Math.max(stats.currentStreak, stats.totalWorkouts)
      : stats.totalWorkouts;
    return val >= m.threshold;
  }).length;

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-primary/20 text-primary border-0 rounded-full py-1 px-4 text-sm font-semibold">
            Digital Asset Vault
          </Badge>
          <h1 className="text-4xl font-extrabold mb-3">Your NFT Achievements</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Soulbound badges that prove your consistency — permanently recorded on Avalanche.
          </p>
          {!isLoading && (
            <div className="mt-6 inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-muted/50 border">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Current Streak</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Total Check-ins</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{earnedCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Earned</p>
              </div>
            </div>
          )}
        </div>

        {/* Achievement Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {MILESTONES.map((item) => {
            const Icon = item.icon;
            const progress = isLoading ? 0 : (() => {
              const val = item.thresholdType === 'streak'
                ? Math.max(stats.currentStreak, stats.totalWorkouts)
                : stats.totalWorkouts;
              return Math.min(100, Math.round((val / item.threshold) * 100));
            })();
            const earned = progress >= 100;
            const claimed = !!claimedMap[item.id];
            const isClaiming = claiming === item.id;

            return (
              <Card
                key={item.id}
                className={cn(
                  "relative overflow-hidden border-2 transition-all duration-300",
                  earned
                    ? claimed
                      ? "border-primary/30 shadow-glow"
                      : `${item.borderColor} shadow-md animate-pulse-border`
                    : "border-muted"
                )}
              >
                {/* Top ribbon for unclaimed earned */}
                {earned && !claimed && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold uppercase px-2 py-0.5 rounded-bl-lg">
                    Ready to claim!
                  </div>
                )}
                {claimed && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Claimed
                  </div>
                )}

                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform shrink-0",
                    item.bg, item.color,
                    earned ? "scale-110" : "opacity-40 grayscale"
                  )}>
                    {earned ? <Icon className="w-8 h-8" /> : <Lock className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className={cn("text-lg font-bold", !earned && "text-muted-foreground")}>
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-0.5">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                        {item.unlockLabel}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  {/* On-chain note */}
                  {item.onChainNote && earned && (
                    <p className="text-[10px] text-primary/70 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {item.onChainNote}
                    </p>
                  )}

                  {/* Claim button — only shown when earned and not yet claimed */}
                  {earned && !claimed && (
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full"
                      disabled={isClaiming}
                      onClick={() => handleClaim(item.id)}
                    >
                      {isClaiming ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Claiming...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Claim NFT Badge</>
                      )}
                    </Button>
                  )}

                  {/* Claimed state */}
                  {claimed && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        Badge claimed — soulbound to your wallet forever.
                      </p>
                    </div>
                  )}

                  {/* Retroactive note for unclaimed earned milestones */}
                  {earned && !claimed && (
                    <p className="text-[10px] text-muted-foreground">
                      Already hit this milestone — retroactive claiming is supported.
                    </p>
                  )}

                  {/* Locked state hint */}
                  {!earned && (
                    <p className="text-[10px] text-muted-foreground text-center py-1">
                      Keep going! You're {progress}% there.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming soon */}
        <div className="mt-16 text-center bg-muted/30 p-12 rounded-3xl border-2 border-dashed border-muted">
          <Medal className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-2xl font-bold mb-2 text-muted-foreground">More Badges Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sport-specific badges for running, lifting, and yoga — plus community challenges. Stay tuned.
          </p>
        </div>
      </div>
    </Layout>
  );
}
