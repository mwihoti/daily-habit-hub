import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { StreakBadge, StatCard, WeekCalendar } from "@/components/StreakComponents";
import { ArrowRight, Users, CheckCircle, Trophy, Flame, Target, Heart } from "lucide-react";

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
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" />
                <span>No gym needed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="container py-8">
        <Card className="max-w-md mx-auto border-2 border-primary/20 shadow-medium animate-fade-in">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your week so far</p>
                <p className="text-2xl font-bold">5 workouts 🎉</p>
              </div>
              <StreakBadge streak={12} size="lg" showLabel={false} />
            </div>
            <WeekCalendar checkedDays={[true, true, false, true, true, true, false]} />
            <Button variant="checkin" className="w-full" asChild>
              <Link href="/check-in">
                <CheckCircle className="w-5 h-5" />
                Check in today
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple tools for{" "}
            <span className="text-gradient">real results</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No complicated tracking. No guilt. Just show up and let the community cheer you on.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group hover:shadow-medium hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {feature.emoji}
                </div>
                <h3 className="font-bold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              People like you are{" "}
              <span className="text-gradient">crushing it</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="hover:shadow-medium transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
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

      {/* CTA */}
      <section className="container py-12 md:py-20">
        <Card className="gradient-hero text-primary-foreground overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <div className="text-5xl">🏆</div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to become the consistent version of yourself?
            </h2>
            <p className="text-lg opacity-90 max-w-xl mx-auto">
              Join thousands of Kenyans building better exercise habits. 
              No perfection needed—just show up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="xl" 
                className="bg-card text-foreground border-0 hover:bg-card/90"
                asChild
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="xl" 
                className="text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/trainers">Find a Coach</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <span className="text-sm">💪</span>
              </div>
              <span className="font-bold">FitTribe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FitTribe. Made with ❤️ in Kenya.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
