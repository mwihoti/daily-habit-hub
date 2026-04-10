'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { WalletConnectSection } from "@/components/WalletConnectSection";
import { useEmbeddedWallet } from "@/hooks/useEmbeddedWallet";

type Goal = "lose_weight" | "build_muscle" | "consistency" | "get_healthier";
type Workout = "home" | "gym" | "outdoor" | "mixed";

const goals: { id: Goal; emoji: string; label: string; sub: string }[] = [
  { id: "lose_weight",   emoji: "⚡", label: "Lose Weight",     sub: "Burn fat and feel lighter" },
  { id: "build_muscle",  emoji: "💪", label: "Build Muscle",    sub: "Get stronger and bigger" },
  { id: "consistency",   emoji: "🔥", label: "Stay Consistent", sub: "Show up every single day" },
  { id: "get_healthier", emoji: "🌱", label: "Get Healthier",   sub: "Improve overall wellness" },
];

const workouts: { id: Workout; emoji: string; label: string; sub: string }[] = [
  { id: "home",    emoji: "🏠", label: "Home",     sub: "No equipment needed" },
  { id: "gym",     emoji: "🏋️", label: "Gym",      sub: "Full equipment access" },
  { id: "outdoor", emoji: "🏃", label: "Outdoor",  sub: "Running, cycling, walks" },
  { id: "mixed",   emoji: "🎯", label: "Mixed",    sub: "Whatever works that day" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const { address, isConnected } = useAccount();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { activeAddress } = useEmbeddedWallet(userId);

  // Load userId early so WalletConnectSection can create the embedded wallet
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  const totalSteps = 3;

  const handleFinish = async (skipWallet = false) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (!userId) setUserId(user.id); // ensure hook is synced if not yet set

      // Use external wallet address if connected, otherwise use embedded wallet address
      const walletAddr = (isConnected && address) ? address : activeAddress;

      await supabase
        .from("profiles")
        .update({
          fitness_goal:           selectedGoal,
          preferred_workout:      selectedWorkout,
          onboarding_completed:   true,
          ...(walletAddr ? { wallet_address: walletAddr } : {}),
        })
        .eq("id", user.id);

      toast.success("You're all set! 🎉", { description: "Let's get your first check-in done." });
      router.push("/check-in");
    } catch (err: any) {
      toast.error("Could not save preferences: " + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                i < step ? "gradient-hero" : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">Step {step} of {totalSteps}</p>
      </div>

      <div className="w-full max-w-md animate-slide-up">

        {/* ── Step 1: Goal ── */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎯</div>
              <h1 className="text-3xl font-display font-bold mb-2">What's your main goal?</h1>
              <p className="text-muted-foreground">We'll personalise your experience around this.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all duration-200",
                    selectedGoal === g.id
                      ? "border-primary bg-primary/10 shadow-glow scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  )}
                >
                  <span className="text-3xl block mb-2">{g.emoji}</span>
                  <span className="font-display font-bold text-sm block mb-1">{g.label}</span>
                  <span className="text-xs text-muted-foreground">{g.sub}</span>
                </button>
              ))}
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!selectedGoal}
              onClick={() => setStep(2)}
            >
              Next <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* ── Step 2: Workout preference ── */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">💪</div>
              <h1 className="text-3xl font-display font-bold mb-2">How do you prefer to work out?</h1>
              <p className="text-muted-foreground">We'll suggest coaches and content that fits.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {workouts.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorkout(w.id)}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all duration-200",
                    selectedWorkout === w.id
                      ? "border-primary bg-primary/10 shadow-glow scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  )}
                >
                  <span className="text-3xl block mb-2">{w.emoji}</span>
                  <span className="font-display font-bold text-sm block mb-1">{w.label}</span>
                  <span className="text-xs text-muted-foreground">{w.sub}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                disabled={!selectedWorkout}
                onClick={() => setStep(3)}
              >
                Next <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Web3 wallet (optional) ── */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⛓️</div>
              <h1 className="text-3xl font-display font-bold mb-2">Earn rewards on Avalanche</h1>
              <p className="text-muted-foreground mb-1">
                Set up a wallet to earn <strong>$HABIT tokens</strong> and mint
                achievement NFTs every time you check in.
              </p>
              <p className="text-sm text-muted-foreground">Totally optional — you can do this later.</p>
            </div>

            <Card className="mb-6 border-2 border-accent/30 bg-accent/5">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { emoji: "🪙", label: "10 $HABIT\nper check-in" },
                    { emoji: "🔥", label: "NFT badges\nfor milestones" },
                    { emoji: "🏆", label: "Leaderboard\nrankings" },
                  ].map((b) => (
                    <div key={b.label} className="p-3 rounded-xl bg-card">
                      <span className="text-2xl block mb-1">{b.emoji}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold whitespace-pre-line">{b.label}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <WalletConnectSection userId={userId} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>
                <ChevronLeft className="w-5 h-5" /> Back
              </Button>
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={() => handleFinish()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Let's go! 🚀</>
                )}
              </Button>
            </div>
            <button
              onClick={() => handleFinish(true)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
              disabled={isSaving}
            >
              Skip wallet for now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
