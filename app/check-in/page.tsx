'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StreakBadge, WeekCalendar } from "@/components/StreakComponents";
import {
  CheckCircle, Camera, X, Globe, Lock, Coins, Share2,
  ArrowRight, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfWeek, isSameDay } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WalletConnectSection } from "@/components/WalletConnectSection";
import { useEmbeddedWallet } from "@/hooks/useEmbeddedWallet";
import {
  ACTIVITY_OPTIONS,
  ACTIVITY_GROUP_LABELS,
  buildActivityNote,
  getActivityDescription,
  getActivityEmoji,
  getActivityLabel,
} from "@/lib/activityTypes";

const GROUP_ORDER = ["move", "recover", "build"] as const;
const ENERGY_LEVELS = ["low", "steady", "high"] as const;
const EFFORT_LEVELS = ["light", "moderate", "hard"] as const;
const DURATION_OPTIONS = [10, 20, 30, 45, 60, 90];
const PROJECT_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

// ─── Confetti Particle ────────────────────────────────────────────────────────
function Confetti() {
  const colors = ["#FF6B2B", "#FF8C00", "#FFD700", "#00FF87", "#00BFFF", "#FF1493"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-confetti"
          style={{
            left:             `${Math.random() * 100}%`,
            top:              `${-10 - Math.random() * 20}%`,
            backgroundColor:  colors[Math.floor(Math.random() * colors.length)],
            animationDelay:   `${Math.random() * 0.8}s`,
            animationDuration:`${0.8 + Math.random() * 0.6}s`,
            transform:        `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Celebration Overlay ──────────────────────────────────────────────────────
function CelebrationScreen({
  streak,
  workoutType,
  earnedNft,
  onContinue,
}: {
  streak: number;
  workoutType?: string | null;
  earnedNft?: { name: string; emoji: string; description: string };
  onContinue: () => void;
}) {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const t = setTimeout(onContinue, 6000);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-50 gradient-hero flex flex-col items-center justify-center p-6 text-white">
      <Confetti />
      <div className="relative text-center animate-scale-in">
        <div className="text-8xl mb-4 animate-bounce-soft">🔥</div>
        <h1 className="font-display font-bold mb-3" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          {streak} Day{streak !== 1 ? "s" : ""}!
        </h1>
        <p className="text-white/90 text-xl font-semibold mb-2">
          {streak === 1
            ? "Day 1 complete. The journey starts now."
            : streak < 7
            ? "You showed up. That's everything."
            : streak < 30
            ? "You're building something real. 🚀"
            : "You are elite. Absolute consistency."}
        </p>
        <p className="text-white/70 text-sm mb-6">Check-in recorded ✓</p>

        {/* NFT earned banner */}
        {earnedNft && (
          <div className="mb-8 mx-auto max-w-xs bg-white/15 border border-white/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-4xl">{earnedNft.emoji}</span>
            <div className="text-left">
              <p className="font-display font-bold text-sm text-yellow-300">NFT Unlocked!</p>
              <p className="font-bold text-white">{earnedNft.name}</p>
              <p className="text-xs text-white/70">{earnedNft.description}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <Button
            size="lg"
            variant="outline"
            className="bg-white/15 border-white/30 text-white hover:bg-white/25 gap-2"
            onClick={async () => {
              const typeLabel = workoutType
                ? getActivityLabel(workoutType)
                : null;
              const text = typeLabel
                ? `I just logged ${typeLabel} and hit a ${streak}-day streak on FitTribe! 🔥`
                : `I just hit a ${streak}-day streak on FitTribe! 🔥`;
              const url = `${window.location.origin}/community`;

              if (navigator.share) {
                try {
                  await navigator.share({ title: "FitTribe", text, url });
                } catch {
                  // user cancelled — do nothing
                }
              } else {
                await navigator.clipboard.writeText(`${text}\n${url}`);
                toast.success("Copied to clipboard!");
              }
            }}
          >
            <Share2 className="w-5 h-5" />
            Share your streak
          </Button>
          <Button
            size="lg"
            className="bg-white text-orange-600 hover:bg-white/90 font-bold gap-2"
            onClick={onContinue}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CheckInPage() {
  const [selectedType, setSelectedType]     = useState<string | null>(null);
  const [customTitle, setCustomTitle]       = useState("");
  const [note, setNote]                     = useState("");
  const [todayWin, setTodayWin]             = useState("");
  const [duration, setDuration]             = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [energy, setEnergy]                 = useState<string | null>(null);
  const [effort, setEffort]                 = useState<string | null>(null);
  const [photo, setPhoto]                   = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]     = useState<string | null>(null);
  const [isPublic, setIsPublic]             = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [finalStreak, setFinalStreak]         = useState(0);

  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const supabase                        = createClient();
  const router                          = useRouter();
  const queryClient                     = useQueryClient();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Must be after the user query so user?.id is in scope
  const { activeAddress, hasWallet } = useEmbeddedWallet(user?.id);

  // Sync active wallet address to profile (covers both embedded and external wallets)
  useEffect(() => {
    if (activeAddress && user?.id) {
      supabase.from("profiles").update({ wallet_address: activeAddress }).eq("id", user.id);
    }
  }, [activeAddress, user?.id, supabase]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("workouts").select("*").eq("user_id", user!.id);
      return data || [];
    },
  });

  const { data: recentCheckins = [] } = useQuery({
    queryKey: ["recent-checkins"],
    queryFn: async () => {
      const { data } = await supabase
        .from("workouts")
        .select("*, profiles(full_name, avatar_url, username, streak)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");

      // 1. Upload photo if present
      let photo_url: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("workout-photos").upload(path, photo);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("workout-photos").getPublicUrl(path);
        photo_url = publicUrl;
      }

      // 2. Pin metadata to IPFS (non-blocking — graceful fallback)
      let metadataUri = "ipfs://placeholder";
      const activityTitle = selectedType === "custom"
        ? customTitle.trim() || "Custom Win"
        : getActivityLabel(selectedType);
      const effectiveDuration = customDuration.trim()
        ? Number.parseInt(customDuration, 10) || null
        : duration;
      const formattedNote = buildActivityNote(note, {
        todayWin,
        energy: energy ?? undefined,
        effort: effort ?? undefined,
        duration: effectiveDuration,
      });

      try {
        const ipfsRes = await fetch("/api/ipfs/pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workout_type: activityTitle,
            note: formattedNote,
            photo_url,
          }),
        });
        if (ipfsRes.ok) {
          const ipfsData = await ipfsRes.json();
          if (ipfsData.uri && ipfsData.uri !== "ipfs://placeholder") {
            metadataUri = ipfsData.uri;
          }
        }
      } catch { /* IPFS is optional */ }

      // 3. Save to Supabase (uses new record_checkin RPC for streak)
      const { data: workout, error: wErr } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          type: selectedType,
          activity_title: activityTitle,
          note: formattedNote,
          duration_minutes: effectiveDuration,
          energy_level: energy,
          effort_level: effort,
          photo_url,
          is_public: isPublic,
        })
        .select()
        .single();
      if (wErr) throw wErr;

      // 4. Fix streak via new safe RPC
      const { data: streakData } = await supabase.rpc("record_checkin", { p_user_id: user.id });
      const newStreak = streakData?.[0]?.new_streak ?? profile?.streak ?? 0;

      // 5. On-chain recording — always via admin wallet (zero gas for user)
      const walletAddr = activeAddress || profile?.wallet_address;
      if (walletAddr) {
        fetch("/api/web3/record-habit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetWallet: walletAddr,
            habitType:    activityTitle,
            metadataUri,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success) {
              setTimeout(() => toast.success("$HABIT tokens minted to your wallet! ✨", { duration: 4000 }), 2500);
            } else if (!data.skipped) {
              setTimeout(() => toast.error("On-chain recording failed — will retry next check-in."), 2500);
            }
          })
          .catch(() => {}); // network error — silent
      }

      return { newStreak };
    },
    onSuccess: ({ newStreak }) => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Invalidate achievement stats so claim buttons appear immediately after check-in
      queryClient.invalidateQueries({ queryKey: ["achievement-stats"] });
      setFinalStreak(newStreak);
      setShowCelebration(true);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Something went wrong");
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const checkedDays = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const d = new Date(startOfThisWeek);
    d.setDate(d.getDate() + i);
    return workouts.some((w: any) => isSameDay(new Date(w.created_at), d));
  });
  const hasCheckedInToday = workouts.some((w: any) => isSameDay(new Date(w.created_at), new Date()));
  const groupedActivityOptions = GROUP_ORDER.map((group) => ({
    group,
    label: ACTIVITY_GROUP_LABELS[group],
    options: ACTIVITY_OPTIONS.filter((option) => option.group === group),
  }));
  const isProjectCheckIn = selectedType === "personal_project";
  const durationChoices = isProjectCheckIn ? PROJECT_DURATION_OPTIONS : DURATION_OPTIONS;
  const selectedActivityLabel = getActivityLabel(selectedType, customTitle);
  const selectedActivityDescription = getActivityDescription(selectedType);

  if (showCelebration) {
    return (
      <CelebrationScreen
        streak={finalStreak}
        workoutType={selectedType}
        onContinue={() => router.push("/dashboard")}
      />
    );
  }

  if (isUserLoading) {
    return (
      <Layout>
        <div className="container min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 max-w-md mx-auto">
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden animate-slide-up">
            <div className="h-2 gradient-hero" />
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-5xl">🔒</div>
              <div>
                <h1 className="text-2xl font-display font-bold mb-2">Sign in to check in</h1>
                <p className="text-muted-foreground text-sm">Track your habits and build your streak.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild variant="hero" size="lg" className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-hero mb-4 shadow-fire">
            <span className="text-4xl">{hasCheckedInToday ? "🎉" : "💪"}</span>
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">
            {hasCheckedInToday ? "You showed up!" : "What progress did you make today?"}
          </h1>
          <p className="text-muted-foreground">
            {hasCheckedInToday
              ? "Keep the streak alive tomorrow."
              : "Log the win, keep the streak moving, and earn your $HABIT."}
          </p>
        </div>

        {/* Current Stats */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <StreakBadge streak={profile?.streak || 0} size="lg" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">This week</p>
                <p className="text-2xl font-display font-bold">
                  {workouts.filter((w: any) => new Date(w.created_at) >= startOfThisWeek).length}/7 💪
                </p>
              </div>
            </div>
            <WeekCalendar checkedDays={checkedDays} />
          </CardContent>
        </Card>

        {/* Web3 Wallet Card */}
        <Card className="mb-6 border-2 border-accent/30 bg-accent/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-chain flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-display font-bold">Earn on Avalanche</p>
                <p className="text-xs text-muted-foreground">
                  {hasWallet
                    ? "Wallet ready — earn 10 $HABIT per check-in (gasless)"
                    : "Get a wallet to earn $HABIT tokens + NFT badges"}
                </p>
              </div>
            </div>
            <WalletConnectSection userId={user?.id} />
          </CardContent>
        </Card>

        {!hasCheckedInToday ? (
          <>
            {/* Activity Type */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-display">What did you do?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {groupedActivityOptions.map((section) => (
                  <div key={section.group} className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {section.label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {section.options.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={cn(
                            "flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                            selectedType === type.id
                              ? "border-primary bg-primary/10 shadow-glow scale-[1.02]"
                              : "border-border hover:border-primary/30 hover:bg-muted"
                          )}
                        >
                          <span className="text-2xl">{type.emoji}</span>
                          <span className="text-sm font-semibold leading-tight">{type.label}</span>
                          <span className="text-[11px] text-muted-foreground">{type.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {selectedType === "custom" && (
                  <div className="rounded-2xl border p-4 space-y-2">
                    <Label htmlFor="custom-title" className="font-semibold">Name your win</Label>
                    <input
                      id="custom-title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Example: Extra steps, meal prep, stretch block..."
                      className="w-full p-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                      maxLength={60}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Momentum details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-display">Make the check-in feel real</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border p-4 bg-muted/30">
                  <p className="font-semibold">{selectedActivityLabel || "Pick an activity to continue"}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedType ? selectedActivityDescription : "You can log workouts, recovery, nutrition wins, sleep targets, or any custom progress."}
                  </p>
                </div>

                {isProjectCheckIn && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-semibold">Log the actual work block</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track the focused time you spent on the project, not your whole day.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="today-win" className="font-semibold">Today's win</Label>
                  <input
                    id="today-win"
                    value={todayWin}
                    onChange={(e) => setTodayWin(e.target.value)}
                    placeholder="What mattered most today?"
                    className="w-full p-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                    maxLength={80}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">
                      {isProjectCheckIn ? "Time spent" : "Duration"}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {durationChoices.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setCustomDuration("");
                            setDuration(duration === value ? null : value);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-full border text-xs font-medium transition-colors",
                            duration === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {value} min
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={5}
                      max={480}
                      step={5}
                      inputMode="numeric"
                      value={customDuration}
                      onChange={(e) => {
                        setCustomDuration(e.target.value);
                        if (e.target.value) setDuration(null);
                      }}
                      placeholder={isProjectCheckIn ? "Custom minutes, e.g. 75" : "Optional custom minutes"}
                      className="w-full p-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Energy</Label>
                    <div className="flex flex-wrap gap-2">
                      {ENERGY_LEVELS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEnergy(energy === value ? null : value)}
                          className={cn(
                            "px-3 py-2 rounded-full border text-xs font-medium capitalize transition-colors",
                            energy === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Effort</Label>
                    <div className="flex flex-wrap gap-2">
                      {EFFORT_LEVELS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEffort(effort === value ? null : value)}
                          className={cn(
                            "px-3 py-2 rounded-full border text-xs font-medium capitalize transition-colors",
                            effort === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add context, what felt good, what was hard, or what you want to remember. 💬"
                  className="w-full p-4 rounded-xl border-2 border-border bg-background resize-none h-24 focus:border-primary focus:outline-none transition-colors"
                  maxLength={200}
                />
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    Add Proof Photo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {photoPreview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setPhoto(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Toggle */}
            <Card className="mb-4">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isPublic ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <Label htmlFor="public-toggle" className="font-bold">Post to Community</Label>
                    <p className="text-xs text-muted-foreground">
                      {isPublic ? "Visible to everyone" : "Only you can see this"}
                    </p>
                  </div>
                </div>
                <Switch id="public-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
              </CardContent>
            </Card>


            {/* Check-in CTA */}
            <Button
              variant="hero"
              size="lg"
              className="w-full text-lg h-14 shadow-glow"
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending || !selectedType || (selectedType === "custom" && !customTitle.trim())}
            >
              {checkInMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Check In Now
                </>
              )}
            </Button>
          </>
        ) : (
          /* Already checked in today */
          <Card className="gradient-hero text-white animate-fade-in mb-8">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl animate-bounce-soft">🔥</div>
              <h2 className="text-2xl font-display font-bold">{profile?.streak || 0} Day Streak!</h2>
              <p className="text-white/80">You've already checked in today. Come back tomorrow!</p>
              <Button variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Community Check-ins */}
        <div className="mt-8">
          <h3 className="font-display font-bold text-lg mb-4">Your tribe is showing up 👀</h3>
          <div className="space-y-3">
            {recentCheckins.length > 0 ? (
              recentCheckins.map((checkin: any, i: number) => (
                <Card key={i} className="hover:shadow-soft transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-lg overflow-hidden shrink-0">
                      {checkin.profiles?.avatar_url ? (
                        <img src={checkin.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{checkin.profiles?.full_name?.charAt(0) || "👤"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">
                          {checkin.profiles?.full_name || checkin.profiles?.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(checkin.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getActivityEmoji(checkin.type)}{" "}
                        {getActivityLabel(checkin.type, checkin.activity_title)}
                      </p>
                    </div>
                    <StreakBadge streak={checkin.profiles?.streak || 0} size="sm" showLabel={false} />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No recent check-ins. Be the first today!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
