'use client';

import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, WeekCalendar, StreakHero } from "@/components/StreakComponents";
import Link from "next/link";
import {
  Flame, Trophy, Target, TrendingUp, Calendar,
  CheckCircle, Plus, BarChart3, Users, Camera, X, Upload, Globe, Lock, Coins
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInWeeks, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  HABIT_REGISTRY_ABI, HABIT_REGISTRY_ADDRESS,
  HABIT_TOKEN_ABI, HABIT_TOKEN_ADDRESS,
} from "@/lib/web3/habitRegistry";

const workoutEmojis: Record<string, string> = {
  gym: "🏋️",
  run: "🏃",
  home: "🏠",
  yoga: "🧘",
  cycling: "🚴",
  other: "💪",
};

export default function DashboardPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const { isConnected, address } = useAccount();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
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

  // Sync wallet address to profile whenever wallet connects
  useEffect(() => {
    if (isConnected && address && user?.id) {
      supabase.from("profiles").update({ wallet_address: address }).eq("id", user.id);
    }
  }, [isConnected, address, user?.id, supabase]);

  // Read $HABIT token balance
  const { data: habitBalanceRaw } = useReadContract({
    address: HABIT_TOKEN_ADDRESS,
    abi: HABIT_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && HABIT_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000" },
  });

  // Check if the connected wallet can still mint today
  const { data: canMintOnChain, refetch: refetchCanMint } = useReadContract({
    address: HABIT_REGISTRY_ADDRESS,
    abi: HABIT_REGISTRY_ABI,
    functionName: "canRecordToday",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && HABIT_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000" },
  });

  const habitBalance = habitBalanceRaw ? Math.floor(Number(habitBalanceRaw) / 1e18) : 0;

  const todayWorkout = workouts.find((w: any) => {
    const d = new Date(w.created_at);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  });

  const handleMintToday = async () => {
    if (!address || !todayWorkout) return;
    setIsMinting(true);
    try {
      const res = await fetch("/api/web3/record-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetWallet: address,
          habitType: todayWorkout.type || "other",
          metadataUri: "ipfs://placeholder",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Proof of Progress minted on Avalanche ⛓️");
        refetchCanMint();
      } else if (data.skipped) {
        toast.info("Already recorded on-chain today");
        refetchCanMint();
      } else {
        toast.error(data.error || "Mint failed");
      }
    } catch {
      toast.error("Mint failed — try again");
    } finally {
      setIsMinting(false);
    }
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ workoutId, file }: { workoutId: string, file: File }) => {
      if (!user) return;
      
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${workoutId}_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('workout-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('workout-photos')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('workouts')
        .update({ photo_url: publicUrl })
        .eq('id', workoutId);
      
      if (updateError) throw updateError;
      
      return publicUrl;
    },
    onSuccess: () => {
      toast.success("Proof photo added! 🔥");
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const togglePrivacyMutation = useMutation({
    mutationFn: async ({ workoutId, isPublic }: { workoutId: string, isPublic: boolean }) => {
      const { error } = await supabase
        .from('workouts')
        .update({ is_public: isPublic })
        .eq('id', workoutId);
      
      if (error) throw error;
      return isPublic;
    },
    onSuccess: (isPublic) => {
      toast.success(isPublic ? "Activity is now public! 🌍" : "Activity is now private! 🔒");
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update privacy");
    }
  });

  const handleOpenPhotoDialog = (workout: any) => {
    setSelectedWorkout(workout);
    setIsPhotoDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsPhotoDialogOpen(false);
    setSelectedWorkout(null);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPhoto = () => {
    if (selectedWorkout && photo) {
      uploadPhotoMutation.mutate({ workoutId: selectedWorkout.id, file: photo });
    }
  };

  // Calculate weeks since joined
  const weeksSinceJoined = user?.created_at 
    ? differenceInWeeks(new Date(), new Date(user.created_at)) + 1
    : 0;

  // Calculate this week's activity
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const checkedDays = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
    const date = new Date(startOfThisWeek);
    date.setDate(date.getDate() + dayIndex);
    return workouts.some((w: any) => isSameDay(new Date(w.created_at), date));
  });

  const weeklyWorkoutCount = workouts.filter((w: any) => 
    new Date(w.created_at) >= startOfThisWeek
  ).length;

  return (
    <Layout>
      <div className="container py-6 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 animate-slide-up">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">
              Hey {profile?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-muted-foreground">Keep showing up. You're doing amazing!</p>
          </div>
          <Button variant="hero" asChild>
            <Link href="/check-in">
              <Plus className="w-5 h-5" />
              Check In
            </Link>
          </Button>
        </div>

        {/* Streak Hero — the most important element on this page */}
        <div className="mb-6">
          <StreakHero
            streak={profile?.streak || 0}
            totalWorkouts={workouts.length}
            hasCheckedInToday={workouts.some((w: any) => {
              const d = new Date(w.created_at);
              const t = new Date();
              return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
            })}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Target}
            value={weeklyWorkoutCount}
            label="This Week"
            variant="primary"
          />
          <StatCard
            icon={Trophy}
            value={workouts.length}
            label="Total Workouts"
          />
          <StatCard
            icon={Calendar}
            value={weeksSinceJoined}
            label="Weeks Active"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Week Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <WeekCalendar checkedDays={checkedDays} />
              
              {/* Weekly Chart */}
              <div className="flex items-end justify-between h-32 gap-2 pt-4">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                   const date = new Date(startOfThisWeek);
                   date.setDate(date.getDate() + dayIndex);
                   const hasWorkout = workouts.some((w: any) => isSameDay(new Date(w.created_at), date));
                   const dayLabel = format(date, "EEE");
                   
                   return (
                    <div key={dayIndex} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          hasWorkout 
                            ? "gradient-hero" 
                            : "bg-muted"
                        }`}
                        style={{ 
                          height: hasWorkout ? "100%" : "20%",
                          animationDelay: `${dayIndex * 100}ms`
                        }}
                      />
                      <span className="text-xs text-muted-foreground font-medium">{dayLabel}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Goal</p>
                  <p className="text-xl font-bold">
                    {weeklyWorkoutCount >= 5 ? "Goal Complete! 🎉" : `${weeklyWorkoutCount}/5 Complete`}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {Math.min(100, Math.round((weeklyWorkoutCount / 5) * 100))}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workouts.length > 0 ? (
                    workouts.slice(0, 4).map((activity: any, index: number) => (
                      <div 
                        key={activity.id} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group transition-all hover:bg-muted cursor-pointer"
                        onClick={() => togglePrivacyMutation.mutate({ 
                          workoutId: activity.id, 
                          isPublic: !activity.is_public 
                        })}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                          {workoutEmojis[activity.type] || "💪"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{activity.note || "Workout session"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {format(new Date(activity.created_at), "MMM d, h:mm a")}
                            <span className="mx-1">•</span>
                            <span className="flex items-center gap-1 text-primary/80 font-medium">
                              {activity.is_public ? (
                                <><Globe className="w-3 h-3" /> Public</>
                              ) : (
                                <><Lock className="w-3 h-3" /> Private</>
                              )}
                            </span>
                          </p>
                        </div>
                        {activity.photo_url ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                            <img src={activity.photo_url} alt="Proof" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation(); // Don't trigger privacy toggle
                              handleOpenPhotoDialog(activity);
                            }}
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/progress" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Progress
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/community" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Community Feed
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Earn on Avalanche */}
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-orange-500" />
                  Earn on Avalanche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isConnected ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {workouts.length > 0
                        ? `You have ${workouts.length} workout${workouts.length !== 1 ? "s" : ""} — connect a wallet to earn $HABIT tokens & NFT badges.`
                        : "Connect a wallet to earn $HABIT tokens and NFT badges for every check-in."}
                    </p>
                    <div className="flex justify-center pt-1">
                      <ConnectButton />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60">
                      <span className="text-sm font-medium text-muted-foreground">$HABIT Balance</span>
                      <span className="font-display font-bold text-orange-500">{habitBalance}</span>
                    </div>

                    {todayWorkout && canMintOnChain && (
                      <div className="p-3 rounded-xl border border-orange-500/20 bg-orange-500/5 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Today&apos;s check-in isn&apos;t on-chain yet — mint to earn 10 $HABIT.
                        </p>
                        <Button
                          variant="hero"
                          size="sm"
                          className="w-full"
                          onClick={handleMintToday}
                          disabled={isMinting}
                        >
                          {isMinting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Coins className="w-4 h-4" />
                              Mint $HABIT
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {todayWorkout && canMintOnChain === false && (
                      <p className="text-xs text-center text-muted-foreground py-1">
                        Today&apos;s check-in is on-chain ✓
                      </p>
                    )}

                    {!todayWorkout && (
                      <p className="text-xs text-center text-muted-foreground py-1">
                        Check in today to earn 10 $HABIT.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Proof of Workout</DialogTitle>
            <DialogDescription>
              Upload a photo to verify your {selectedWorkout?.type} session from {selectedWorkout && format(new Date(selectedWorkout.created_at), "MMM d")}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            {!photoPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload photo</p>
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              variant="hero" 
              onClick={handleSubmitPhoto}
              disabled={!photo || isUploading}
            >
              {isUploading ? "Uploading..." : "Save Proof"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
