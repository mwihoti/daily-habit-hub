'use client';

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Medal, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MEDAL_COLORS = [
  "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
  "text-slate-400 bg-slate-400/10 border-slate-400/30",
  "text-amber-700 bg-amber-700/10 border-amber-700/30",
];

const RANK_ICONS = [
  <Trophy key="1" className="w-4 h-4 text-yellow-500" />,
  <Medal  key="2" className="w-4 h-4 text-slate-400"  />,
  <Medal  key="3" className="w-4 h-4 text-amber-700"  />,
];

export default function LeaderboardPage() {
  const supabase = createClient();

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Top 50 by streak, tiebreak by total_workouts
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, streak, total_workouts')
        .order('streak', { ascending: false })
        .order('total_workouts', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    refetchInterval: 60_000, // refresh every minute
  });

  // Find current user's rank
  const myRank = leaders.findIndex((l) => l.id === currentUser?.id) + 1;
  const me = leaders.find((l) => l.id === currentUser?.id);

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-extrabold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top streaks in the FitTribe community. Updated every minute.</p>
        </div>

        {/* My rank card — only if signed in and ranked */}
        {me && myRank > 0 && (
          <Card className="mb-6 border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                #{myRank}
              </div>
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={me.avatar_url ?? undefined} />
                <AvatarFallback className="text-sm gradient-hero text-white">
                  {(me.full_name || me.username || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{me.full_name || me.username || 'You'}</p>
                <p className="text-xs text-muted-foreground">Your current rank</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <p className="font-bold text-orange-500 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />{me.streak ?? 0}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase">Streak</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">{me.total_workouts ?? 0}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">Check-ins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 podium */}
        {!isLoading && leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* 2nd place */}
            <div className="flex flex-col items-center pt-6">
              <Avatar className="w-14 h-14 border-4 border-slate-400/40 mb-2">
                <AvatarImage src={leaders[1]?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-slate-400/20 text-slate-600">
                  {(leaders[1]?.full_name || leaders[1]?.username || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xl mb-1">🥈</span>
              <p className="text-xs font-bold text-center truncate w-full px-1">
                {leaders[1]?.full_name || leaders[1]?.username || '—'}
              </p>
              <p className="text-xs text-orange-500 font-bold flex items-center gap-0.5">
                <Flame className="w-3 h-3" />{leaders[1]?.streak ?? 0}d
              </p>
              <div className="w-full mt-2 bg-slate-400/20 rounded-t-lg h-16" />
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-18 h-18 border-4 border-yellow-500/50 mb-2" style={{ width: 72, height: 72 }}>
                  <AvatarImage src={leaders[0]?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-lg bg-yellow-500/20 text-yellow-700">
                    {(leaders[0]?.full_name || leaders[0]?.username || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
              </div>
              <span className="text-xl mb-1">🥇</span>
              <p className="text-xs font-bold text-center truncate w-full px-1">
                {leaders[0]?.full_name || leaders[0]?.username || '—'}
              </p>
              <p className="text-xs text-orange-500 font-bold flex items-center gap-0.5">
                <Flame className="w-3 h-3" />{leaders[0]?.streak ?? 0}d
              </p>
              <div className="w-full mt-2 bg-yellow-500/20 rounded-t-lg h-24" />
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center pt-10">
              <Avatar className="w-14 h-14 border-4 border-amber-700/40 mb-2">
                <AvatarImage src={leaders[2]?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-amber-700/20 text-amber-800">
                  {(leaders[2]?.full_name || leaders[2]?.username || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xl mb-1">🥉</span>
              <p className="text-xs font-bold text-center truncate w-full px-1">
                {leaders[2]?.full_name || leaders[2]?.username || '—'}
              </p>
              <p className="text-xs text-orange-500 font-bold flex items-center gap-0.5">
                <Flame className="w-3 h-3" />{leaders[2]?.streak ?? 0}d
              </p>
              <div className="w-full mt-2 bg-amber-700/20 rounded-t-lg h-10" />
            </div>
          </div>
        )}

        {/* Full list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : leaders.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">
                No check-ins yet — be the first on the board!
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {leaders.map((leader, i) => {
                  const isMe = leader.id === currentUser?.id;
                  const rank = i + 1;
                  return (
                    <li
                      key={leader.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors",
                        isMe && "bg-primary/5"
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        "w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0",
                        rank <= 3 ? MEDAL_COLORS[rank - 1] : "text-muted-foreground border-border"
                      )}>
                        {rank <= 3 ? RANK_ICONS[rank - 1] : rank}
                      </div>

                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage src={leader.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs gradient-hero text-white">
                          {(leader.full_name || leader.username || '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", isMe && "text-primary")}>
                          {leader.full_name || leader.username || 'Anonymous'}
                          {isMe && <span className="ml-1.5 text-[10px] text-primary font-bold">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {leader.total_workouts ?? 0} total check-ins
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-orange-500 font-bold">
                        <Flame className="w-4 h-4" />
                        <span className="text-sm">{leader.streak ?? 0}</span>
                        <span className="text-xs text-muted-foreground font-normal">days</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <section className="mt-12 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Why the workout streak leaderboard exists</h2>
              <p className="text-muted-foreground">
                The FitTribe leaderboard turns consistency into something visible. Members can
                compare workout streaks, total check-ins, and community momentum without losing
                the simplicity of a daily habit tracker.
              </p>
              <p className="text-muted-foreground">
                For people searching for a workout streak tracker or accountability fitness app,
                this page shows how public rankings support motivation and routine-building.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Track the habit</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how daily check-ins, streaks, and routine-building fit into the wider product.
                </p>
                <a href="/fitness-habit-tracker" className="text-sm text-primary hover:underline">
                  Read about habit tracking
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">See community momentum</h3>
                <p className="text-sm text-muted-foreground">
                  Rankings matter more when they sit beside a live workout accountability community.
                </p>
                <a href="/community" className="text-sm text-primary hover:underline">
                  Visit the community
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Understand rewards</h3>
                <p className="text-sm text-muted-foreground">
                  FitTribe combines public streaks with blockchain fitness rewards and milestone badges.
                </p>
                <a href="/blockchain-fitness-rewards" className="text-sm text-primary hover:underline">
                  Learn how rewards work
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}
