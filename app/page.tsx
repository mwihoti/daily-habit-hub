'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { StreakBadge, StatCard, WeekCalendar } from "@/components/StreakComponents";
import { ArrowRight, Users, CheckCircle, Trophy, Flame, Target, Heart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek, isSameDay } from "date-fns";

const features = [
  {
    icon: CheckCircle,
    title: "Daily Check-ins",
    description: "One tap to log your workout. No complicated tracking.",
    emoji: "✅",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "See friends working out. Stay motivated together.",
    emoji: "👥",
  },
  {
    icon: Flame,
    title: "Streak Tracking",
    description: "Build consistency. Celebrate your progress.",
    emoji: "🔥",
  },
  {
    icon: Target,
    title: "Find a Coach",
    description: "Affordable online coaching from certified trainers.",
    emoji: "🎯",
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
    text: "My coach helped me lose 10kg in 3 months. Best investment in myself!",
    streak: 89,
    avatar: "💪",
  },
  {
    name: "Mary W.",
    location: "Kisumu",
    text: "I've never been this consistent with exercise. The streaks motivate me!",
    streak: 32,
    avatar: "🧘‍♀️",
  },
];

export default function LandingPage() {
  const supabase = createClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch profile for streak
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      return data;
    }
  });

  // Fetch workouts for week calendar
  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('workouts').select('*').eq('user_id', user?.id);
      return data || [];
    }
  });

  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <span>🇰🇪</span>
              <span>{user ? `Welcome back, ${profile?.full_name?.split(' ')[0] || 'Warrior'}` : "Built for Kenya, made for everyone"}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {user ? (
                <>You've done <span className="text-gradient">{workouts.length}</span> workouts. Keep it up!</>
              ) : (
                <>Show up. <span className="text-gradient">Stay consistent.</span> Get fit together.</>
              )}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {user 
                ? "Your journey to a healthier life is in progress. Check in today to keep your streak alive!" 
                : "The simple fitness app that helps you build exercise habits through daily accountability, community support, and affordable coaching."
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {user ? (
                <Button variant="hero" size="xl" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <Button variant="hero" size="xl" asChild>
                  <Link href="/register">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="xl" asChild>
                <Link href="/community">
                  <Users className="w-5 h-5" />
                  View Community
                </Link>
              </Button>
            </div>
            
            {!user && (
              <div className="flex items-center justify-center gap-6 pt-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Join 1,000+ members</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 border-y bg-muted/20">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <StatCard 
              label={user ? "Your Day Streak" : "Active members"} 
              value={user ? (profile?.streak || 0).toString() : "1,234"}
              icon={user ? Flame : Users}
              trend={user ? "Keep it burning! 🔥" : "+23% this month"}
            />
            <StatCard 
              label={user ? "Your Workouts" : "Workouts logged"} 
              value={user ? workouts.length.toString() : "45.6K"}
              icon={CheckCircle}
              trend={user ? "Great consistency!" : "+156 today"}
            />
            <StatCard 
              label="Certified trainers" 
              value="48"
              icon={Trophy}
              trend="All verified"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to{" "}
              <span className="text-gradient">stay consistent</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple tools that work. No gimmicks, just results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover group">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {feature.emoji}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Streak Demo / Real Stats */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <StreakBadge streak={user ? (profile?.streak || 0) : 15} size="lg" />
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {user ? "Your Weekly Activity" : "Build your streak"}
                      </h3>
                      <p className="text-muted-foreground">
                        {user 
                          ? `You've checked in ${weeklyWorkoutCount} out of 7 days this week. Don't break the chain!`
                          : "Check in daily and watch your streak grow. The longer your streak, the more motivated you'll be to keep going!"
                        }
                      </p>
                    </div>
                    <Button variant="hero" asChild>
                      <Link href="/check-in">
                        {user ? "Check In Today" : "Start Your Streak"}
                        <Flame className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <WeekCalendar 
                      checkedDays={user ? checkedDays : [true, true, true, false, true, true, true]}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      {user ? `${weeklyWorkoutCount} out of 7 days this week 🎯` : "6 out of 7 days this week 🎯"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {!user && (
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Real people. Real results.
              </h2>
              <p className="text-muted-foreground text-lg">
                Join thousands building better habits across Kenya
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="card-hover">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{testimonial.text}</p>
                    <StreakBadge streak={testimonial.streak} size="sm" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-energy opacity-5" />
        <div className="container relative">
          <Card className="max-w-3xl mx-auto overflow-hidden shadow-glow border-primary/20">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  {user ? "Keep your momentum going!" : "Ready to build your fitness habit?"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {user ? "Your next workout is waiting. Show up for yourself today." : "Start free. Cancel anytime. Build consistency that lasts."}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button variant="hero" size="xl" asChild>
                    <Link href="/check-in">
                      Log Today's Workout
                      <CheckCircle className="w-5 h-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="hero" size="xl" asChild>
                    <Link href="/register">
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="xl" asChild>
                  <Link href={user ? "/progress" : "/trainers"}>
                    <Target className="w-5 h-5" />
                    {user ? "View Full Progress" : "Find a Trainer"}
                  </Link>
                </Button>
              </div>

              {!user && (
                <div className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-primary text-primary" />
                    <span>No credit card required</span>
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
