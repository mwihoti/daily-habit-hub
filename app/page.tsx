'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { StreakBadge, StatCard, WeekCalendar } from "@/components/StreakComponents";
import { ArrowRight, Users, CheckCircle, Trophy, Flame, Target, Heart } from "lucide-react";
import Link from "next/link";

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
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <span>🇰🇪</span>
              <span>Built for Kenya, made for everyone</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Show up.{" "}
              <span className="text-gradient">Stay consistent.</span>{" "}
              Get fit together.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The simple fitness app that helps you build exercise habits through daily accountability, 
              community support, and affordable coaching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="xl" asChild>
                <Link href="/register">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/community">
                  <Users className="w-5 h-5" />
                  View Community
                </Link>
              </Button>
            </div>
            
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
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 border-y bg-muted/20">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <StatCard 
              label="Active members" 
              value="1,234"
              icon={Users}
              trend="+23% this month"
            />
            <StatCard 
              label="Workouts logged" 
              value="45.6K"
              icon={CheckCircle}
              trend="+156 today"
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

      {/* Streak Demo */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <StreakBadge streak={15} size="lg" />
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        Build your streak
                      </h3>
                      <p className="text-muted-foreground">
                        Check in daily and watch your streak grow. The longer your streak, 
                        the more motivated you'll be to keep going!
                      </p>
                    </div>
                    <Button asChild>
                      <Link href="/check-in">
                        Start Your Streak
                        <Flame className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <WeekCalendar 
                      days={[true, true, true, false, true, true, true]}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      6 out of 7 days this week 🎯
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-energy opacity-5" />
        <div className="container relative">
          <Card className="max-w-3xl mx-auto overflow-hidden shadow-glow border-primary/20">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to build your{" "}
                  <span className="text-gradient">fitness habit?</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Start free. Cancel anytime. Build consistency that lasts.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link href="/trainers">
                    <Target className="w-5 h-5" />
                    Find a Trainer
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-primary text-primary" />
                  <span>No credit card required</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
