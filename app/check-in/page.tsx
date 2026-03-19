'use client';

import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StreakBadge, WeekCalendar } from "@/components/StreakComponents";
import { CheckCircle, Dumbbell, Heart, Bike, PersonStanding, Home, Timer, Send, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfWeek, isSameDay } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Lock, Coins } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract } from 'wagmi';
import { HABIT_REGISTRY_ABI, HABIT_REGISTRY_ADDRESS } from "@/lib/web3/habitRegistry";

const workoutTypes = [
  { id: "gym", icon: Dumbbell, label: "Gym", emoji: "🏋️" },
  { id: "run", icon: PersonStanding, label: "Run/Walk", emoji: "🏃" },
  { id: "home", icon: Home, label: "Home Workout", emoji: "🏠" },
  { id: "cycling", icon: Bike, label: "Cycling", emoji: "🚴" },
  { id: "yoga", icon: Heart, label: "Yoga/Stretch", emoji: "🧘" },
  { id: "other", icon: Timer, label: "Other", emoji: "💪" },
];

export default function CheckInPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [recordOnChain, setRecordOnChain] = useState(false);
  const { isConnected, address, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // sync wallet address to profile
  useEffect(() => {
    if (isConnected && address && user?.id) {
      supabase
        .from('profiles')
        .update({ wallet_address: address })
        .eq('id', user.id)
        .then(({ error }) => {
          if (!error) queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        });
    }
  }, [isConnected, address, user?.id, supabase, queryClient]);

  // Fetch profile for streak
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      return data;
    }
  });

  // Fetch recent workouts for this week's checklist
  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('workouts').select('*').eq('user_id', user?.id);
      return data || [];
    }
  });

  // Fetch recent check-ins from others (friends/community)
  const { data: recentCheckins = [] } = useQuery({
    queryKey: ['recent-checkins'],
    queryFn: async () => {
      const { data } = await supabase
        .from('workouts')
        .select('*, profiles(full_name, avatar_url, username, streak)')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");

      let photo_url = null;
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('workout-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('workout-photos')
          .getPublicUrl(fileName);

        photo_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          type: selectedType,
          note,
          photo_url,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      // On-chain recording
      if (recordOnChain && isConnected) {
        try {
          // You might want to generate a metadata URI properly here, maybe pins on IPFS?
          // For now we'll just use the note or a placeholder.
          const metadataUri = photo_url || note || "Daily habit completion";
          
          await writeContractAsync({
            address: HABIT_REGISTRY_ADDRESS,
            abi: HABIT_REGISTRY_ABI,
            functionName: 'recordHabit',
            args: [selectedType || "unknown", metadataUri],
            account: address,
            chain: chain,
          });
          toast.info("On-chain record created! ⛓️");
        } catch (web3Error: any) {
          console.error("Web3 record failed:", web3Error);
          // We don't necessarily want to fail the whole check-in if on-chain fails,
          // but we should inform the user.
          toast.warning("Check-in saved, but on-chain record failed.");
        }
      }

      // Update streak and total workouts in profile
      await supabase.rpc('increment_workout_count', { user_id: user.id });

      return data;
    },
    onSuccess: () => {
      toast.success("🎉 You're on fire! Keep it up!");
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    }
  });

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

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const checkedDays = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
    const date = new Date(startOfThisWeek);
    date.setDate(date.getDate() + dayIndex);
    return workouts.some(w => isSameDay(new Date(w.created_at), date));
  });

  const hasCheckedInToday = workouts.some(w => isSameDay(new Date(w.created_at), new Date()));

  if (isUserLoading) {
    return (
      <Layout>
        <div className="container min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse font-medium">Loading your progress...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 md:py-24 max-w-md mx-auto px-4">
          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden animate-slide-up bg-card/50 backdrop-blur-sm">
            <div className="h-2 bg-gradient-hero" />
            <CardContent className="p-8 text-center space-y-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-4xl shadow-glow transition-transform hover:scale-110 duration-300">
                🔒
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
                <p className="text-muted-foreground leading-relaxed">
                  You need to be authenticated to access the check-in page and record your habits.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button asChild size="xl" variant="hero" className="w-full shadow-lg">
                  <Link href="/login">Sign In to Continue</Link>
                </Button>
                <div className="flex items-center gap-2 py-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">or</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <Button asChild variant="outline" size="xl" className="w-full hover:bg-primary/5 border-primary/20">
                  <Link href="/register">Create New Account</Link>
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-hero mb-4">
            <span className="text-4xl">{hasCheckedInToday ? "🎉" : "💪"}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {hasCheckedInToday ? "You showed up!" : "Did you work out today?"}
          </h1>
          <p className="text-muted-foreground">
            {hasCheckedInToday
              ? "Amazing! Keep the streak going tomorrow."
              : "Just checking in keeps you accountable."}
          </p>
        </div>

        {/* Web3 Wallet Connection */}
        <Card className="mb-8 border-2 border-dashed border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Avalanche Rewards</h3>
              <p className="text-sm text-muted-foreground px-4">
                Connect your wallet to earn $HABIT tokens and record your progress on-chain.
              </p>
            </div>
            <ConnectButton />
          </CardContent>
        </Card>

        {/* Current Stats */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <StreakBadge streak={profile?.streak || 0} size="lg" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">This week</p>
                <p className="text-2xl font-bold">{workouts.filter(w => new Date(w.created_at) >= startOfThisWeek).length}/7 💪</p>
              </div>
            </div>
            <WeekCalendar checkedDays={checkedDays} />
          </CardContent>
        </Card>

        {(!hasCheckedInToday) ? (
          <>
            {/* Workout Type Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">What did you do?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {workoutTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                        selectedType === type.id
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-border hover:border-primary/30 hover:bg-muted"
                      )}
                    >
                      <span className="text-2xl">{type.emoji}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optional Note & Photo */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add details (optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How was your workout? 💬"
                  className="w-full p-4 rounded-xl border-2 border-border bg-background resize-none h-24 focus:border-primary focus:outline-none transition-colors"
                  maxLength={200}
                />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
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
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border group">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={removePhoto}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Toggle */}
            <Card className="mb-6">
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
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </CardContent>
            </Card>

            {/* Avalanche Toggle */}
            {isConnected && (
              <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <Label htmlFor="chain-toggle" className="font-bold">Record on Avalanche</Label>
                      <p className="text-xs text-muted-foreground">
                        Mint a "Proof of Progress" for this activity
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="chain-toggle"
                    checked={recordOnChain}
                    onCheckedChange={setRecordOnChain}
                  />
                </CardContent>
              </Card>
            )}

            {/* Check-in Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending || !selectedType}
            >
              {checkInMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Checking in...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Check In Now
                </>
              )}
            </Button>
          </>
        ) : (
          /* Success State */
          <Card className="gradient-hero text-primary-foreground animate-fade-in mb-8">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl animate-bounce-soft">🔥</div>
              <h2 className="text-2xl font-bold">{profile?.streak || 0} Day Streak!</h2>
              <p className="opacity-90">You've completed your activity for today. Well done!</p>
              <Button
                variant="outline"
                className="bg-card text-foreground border-0 mx-auto"
                asChild
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Community/Friends Check-ins */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">Friends working out now 👀</h3>
          <div className="space-y-3">
            {recentCheckins.length > 0 ? (
              recentCheckins.map((checkin: any, index: number) => (
                <Card key={index} className="hover:shadow-soft transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl overflow-hidden">
                      {checkin.profiles?.avatar_url ? (
                        <img src={checkin.profiles.avatar_url} alt={checkin.profiles.username} className="w-full h-full object-cover" />
                      ) : (
                        <span>{checkin.profiles?.full_name?.charAt(0) || "👤"}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{checkin.profiles?.full_name || checkin.profiles?.username || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground">{new Date(checkin.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {workoutTypes.find(t => t.id === checkin.type)?.emoji} {workoutTypes.find(t => t.id === checkin.type)?.label}
                      </p>
                    </div>
                    <StreakBadge streak={checkin.profiles?.streak || 0} size="sm" showLabel={false} />
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No recent community check-ins</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
