'use client';

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StreakBadge, WeekCalendar } from "@/components/StreakComponents";
import { CheckCircle, Dumbbell, Heart, Bike, PersonStanding, Home, Timer, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const workoutTypes = [
  { id: "gym", icon: Dumbbell, label: "Gym", emoji: "🏋️" },
  { id: "run", icon: PersonStanding, label: "Run/Walk", emoji: "🏃" },
  { id: "home", icon: Home, label: "Home Workout", emoji: "🏠" },
  { id: "cycling", icon: Bike, label: "Cycling", emoji: "🚴" },
  { id: "yoga", icon: Heart, label: "Yoga/Stretch", emoji: "🧘" },
  { id: "other", icon: Timer, label: "Other", emoji: "💪" },
];

const recentCheckins = [
  { name: "Sarah M.", type: "gym", time: "2 mins ago", streak: 45, avatar: "🏃‍♀️" },
  { name: "James K.", type: "run", time: "15 mins ago", streak: 89, avatar: "💪" },
  { name: "Mary W.", type: "yoga", time: "1 hour ago", streak: 32, avatar: "🧘‍♀️" },
];

export default function CheckInPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    if (!selectedType) {
      toast.error("Please select a workout type");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setHasCheckedIn(true);
    toast.success("🎉 You're on fire! Keep it up!", {
      description: "Your streak is now 13 days!",
    });
  };

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-hero mb-4">
            <span className="text-4xl">{hasCheckedIn ? "🎉" : "💪"}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {hasCheckedIn ? "You showed up!" : "Did you work out today?"}
          </h1>
          <p className="text-muted-foreground">
            {hasCheckedIn 
              ? "Amazing! Keep the streak going tomorrow." 
              : "Just checking in keeps you accountable."}
          </p>
        </div>

        {/* Current Stats */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <StreakBadge streak={12} size="lg" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">This week</p>
                <p className="text-2xl font-bold">5/7 💪</p>
              </div>
            </div>
            <WeekCalendar checkedDays={[true, true, false, true, true, true, false]} />
          </CardContent>
        </Card>

        {!hasCheckedIn ? (
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

            {/* Optional Note */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add a note (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How was your workout? 💬"
                  className="w-full p-4 rounded-xl border-2 border-border bg-background resize-none h-24 focus:border-primary focus:outline-none transition-colors"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-2">{note.length}/200</p>
              </CardContent>
            </Card>

            {/* Check-in Button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={handleCheckIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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

            {/* Didn't work out */}
            <div className="text-center mt-4">
              <button className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline transition-colors">
                I didn't work out today (that's okay!)
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <Card className="gradient-hero text-primary-foreground animate-fade-in">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl animate-bounce-soft">🔥</div>
              <h2 className="text-2xl font-bold">13 Day Streak!</h2>
              <p className="opacity-90">You're in the top 10% of consistent exercisers this week.</p>
              <div className="flex gap-3 justify-center pt-4">
                <Button 
                  variant="outline" 
                  className="bg-card text-foreground border-0"
                  onClick={() => toast.info("Shared to community!")}
                >
                  <Send className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Community Check-ins */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">Friends working out now 👀</h3>
          <div className="space-y-3">
            {recentCheckins.map((checkin, index) => (
              <Card key={index} className="hover:shadow-soft transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {checkin.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{checkin.name}</span>
                      <span className="text-xs text-muted-foreground">{checkin.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workoutTypes.find(t => t.id === checkin.type)?.emoji} {workoutTypes.find(t => t.id === checkin.type)?.label}
                    </p>
                  </div>
                  <StreakBadge streak={checkin.streak} size="sm" showLabel={false} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
