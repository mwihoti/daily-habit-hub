'use client';

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Star, Crown, ShieldCheck, Heart, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const achievements = [
  {
    id: "genesis",
    title: "Genesis NFT Badge",
    description: "Welcome to the FitTribe! Earned for your first check-in.",
    unlockCondition: "1 Workout Logged",
    icon: Star,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    isUnlocked: (stats: any) => stats.totalWorkouts >= 1
  },
  {
    id: "consistency",
    title: "Iron Will",
    description: "Built a solid foundation for a healthy lifestyle.",
    unlockCondition: "7 Day Streak",
    icon: ShieldCheck,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    isUnlocked: (stats: any) => stats.currentStreak >= 7
  },
  {
    id: "monthly-pro",
    title: "Consistency Architect",
    description: "Showing up consistently for an entire month.",
    unlockCondition: "30 Day Streak",
    icon: Flame,
    color: "text-red-500",
    bg: "bg-red-500/10",
    isUnlocked: (stats: any) => stats.currentStreak >= 30
  },
  {
    id: "legendary",
    title: "FitTribe Legend",
    description: "The ultimate show of grit and community leadership.",
    unlockCondition: "49 Day (7-Week) Streak",
    icon: Crown,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    isUnlocked: (stats: any) => stats.currentStreak >= 49
  },
  {
    id: "goal-getter",
    title: "Visionary",
    description: "Completed your first long-term goal.",
    unlockCondition: "1 Goal Completed",
    icon: Trophy,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    isUnlocked: (stats: any) => stats.completedGoals >= 1
  },
  {
    id: "social-leader",
    title: "Tribe Guardian",
    description: "Staying active and engaging with the community.",
    unlockCondition: "5 Community Check-ins",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    isUnlocked: (stats: any) => stats.totalWorkouts >= 5
  }
];

export default function AchievementsPage() {
  const supabase = createClient();

  // Fetch current user & stats (Mocked logic for now, using dummy stats)
  const { data: stats = { totalWorkouts: 12, currentStreak: 13, completedGoals: 1 }, isLoading } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      // In a real app we'd fetch actual user stats from supabase here
      // const { data } = await supabase.rpc('get_user_stats');
      return { totalWorkouts: 12, currentStreak: 13, completedGoals: 1 };
    }
  });

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-0 rounded-full py-1 px-4 text-sm font-semibold">
            Digital Asset Vault 🏆
          </Badge>
          <h1 className="text-4xl font-extrabold mb-4">Your Achievements</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            These are your **Soulbound NFT Badges**. They represent your consistency and 
            grit, permanently recorded on the blockchain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {achievements.map((item) => {
            const unlocked = item.isUnlocked(stats);
            const Icon = item.icon;
            
            return (
              <Card key={item.id} className={cn(
                "relative overflow-hidden border-2 transition-all duration-300",
                unlocked ? "border-primary/20 shadow-glow" : "border-muted opacity-60 grayscale"
              )}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform",
                    item.bg, item.color,
                    unlocked && "scale-110"
                  )}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                      {unlocked && <Badge className="bg-green-500 hover:bg-green-500">Unlocked</Badge>}
                    </div>
                    <CardDescription className="text-sm">{item.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between py-2 border-t mt-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Condition</span>
                    <span className="text-sm font-bold flex items-center gap-1">
                      {unlocked ? <Badge className="bg-primary/10 text-primary border-primary/20">Verified On-Chain</Badge> : item.unlockCondition}
                    </span>
                  </div>
                  {!unlocked && (
                    <div className="mt-4 p-3 rounded-lg bg-orange-500/5 text-orange-500 text-xs flex items-center gap-2 font-medium">
                      <Info className="w-4 h-4" />
                      Keep showing up! You're almost there.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center bg-muted/30 p-12 rounded-3xl border-2 border-dashed border-muted">
          <Medal className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-2xl font-bold mb-2 text-muted-foreground">More Badges Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're launching specific challenges for weightlifting, running, and yoga. 
            Stay tuned to the community feed!
          </p>
        </div>
      </div>
    </Layout>
  );
}
