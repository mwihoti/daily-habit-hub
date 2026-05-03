'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Search, Users, Dumbbell, Home as HomeIcon, PersonStanding, Scale, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainerProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  specialties: string[];
  experience_years: number;
  price_monthly: number;
  group_price_monthly: number;
  rating: number;
  review_count: number;
  client_count: number;
  is_verified: boolean;
}

const specialtyFilters = [
  { id: "all", label: "All", icon: Users },
  { id: "Beginners", label: "Beginners", icon: Star },
  { id: "Weight Loss", label: "Weight Loss", icon: Scale },
  { id: "Gym", label: "Gym", icon: Dumbbell },
  { id: "Home Workouts", label: "Home Workouts", icon: HomeIcon },
  { id: "Running", label: "Running", icon: PersonStanding },
];

function TrainerAvatar({ url, name }: { url: string | null; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-16 h-16 rounded-2xl object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center text-xl font-bold text-primary-foreground shrink-0">
      {initials}
    </div>
  );
}

export default function TrainersPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTrainers() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (activeFilter !== "all") params.set("specialty", activeFilter);

        const res = await fetch(`/api/trainers?${params}`, { signal: controller.signal });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load trainers");
        setTrainers(data.trainers ?? []);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrainers();
    return () => controller.abort();
  }, [search, activeFilter]);

  return (
    <Layout>
      <div className="container py-6 md:py-12">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Find a Coach 🎯</h1>
          <p className="text-muted-foreground">
            Affordable online coaching from verified trainers. No gym needed.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search trainers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {specialtyFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="shrink-0"
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">Could not load trainers</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && trainers.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-bold text-lg mb-2">No trainers found</h3>
            <p className="text-muted-foreground">
              {search || activeFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Be the first to join as a trainer!"}
            </p>
          </div>
        )}

        {!isLoading && !error && trainers.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer, index) => (
              <Link
                key={trainer.id}
                href={`/trainers/${trainer.id}`}
                className="block"
              >
                <Card
                  className="h-full hover:shadow-medium hover:border-primary/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <TrainerAvatar url={trainer.avatar_url} name={trainer.full_name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg truncate">{trainer.full_name}</h3>
                          {trainer.is_verified && (
                            <span className="text-primary text-sm shrink-0">✓</span>
                          )}
                        </div>
                        {trainer.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{trainer.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specialties */}
                    {trainer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {trainer.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            {specialty}
                          </span>
                        ))}
                        {trainer.specialties.length > 3 && (
                          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                            +{trainer.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    {trainer.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {trainer.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-streak fill-streak" />
                        <span className="font-bold">
                          {trainer.rating > 0 ? trainer.rating.toFixed(1) : "New"}
                        </span>
                        {trainer.review_count > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({trainer.review_count})
                          </span>
                        )}
                      </div>
                      {trainer.client_count > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{trainer.client_count} clients</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-4 p-3 rounded-xl bg-muted text-center">
                      {trainer.price_monthly > 0 ? (
                        <>
                          <p className="text-sm text-muted-foreground">Starting at</p>
                          <p className="text-xl font-bold text-primary">
                            KES {trainer.price_monthly.toLocaleString()}/mo
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-muted-foreground">
                          Contact for pricing
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Become a Trainer CTA */}
        <Card className="mt-12 gradient-energy text-secondary-foreground">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold mb-2">Are you a fitness trainer?</h2>
            <p className="opacity-90 mb-6 max-w-md mx-auto">
              Join our platform and start earning by coaching clients online. No gym dependency.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="bg-card text-foreground border-0"
              asChild
            >
              <Link href="/trainer-setup">Apply to be a Coach</Link>
            </Button>
          </CardContent>
        </Card>

        <section className="mt-12 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Personal trainers and online fitness coaching on FitTribe</h2>
              <p className="text-muted-foreground">
                FitTribe helps members compare coaches by specialty, location, pricing, and
                experience. That makes this page useful for people searching for personal
                trainers in Nairobi, affordable online coaching, and a fitness coach marketplace.
              </p>
              <p className="text-muted-foreground">
                Use the filters to narrow by goals like weight loss, gym training, beginners,
                home workouts, and running support. Then open a trainer profile to compare
                availability, qualifications, and next steps.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Start with the habit tracker</h3>
                <p className="text-sm text-muted-foreground">
                  Build daily momentum with streaks and check-ins before layering on deeper coaching support.
                </p>
                <Link href="/fitness-habit-tracker" className="text-sm text-primary hover:underline">
                  Explore the tracker
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Stay accountable publicly</h3>
                <p className="text-sm text-muted-foreground">
                  Use the community feed to keep motivation visible while your coach guides the plan.
                </p>
                <Link href="/community" className="text-sm text-primary hover:underline">
                  Visit the community
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold">Understand the reward layer</h3>
                <p className="text-sm text-muted-foreground">
                  FitTribe also connects coaching and consistency to blockchain fitness rewards on Avalanche.
                </p>
                <Link href="/crypto-fitness-app" className="text-sm text-primary hover:underline">
                  See the crypto fitness side
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}
