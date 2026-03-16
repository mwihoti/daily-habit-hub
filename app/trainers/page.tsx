'use client';

import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Search, Filter, Users, Dumbbell, Home as HomeIcon, PersonStanding, Scale } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const trainers = [
  {
    id: "1",
    name: "Coach Michael O.",
    location: "Nairobi",
    avatar: "👨‍🏫",
    specialties: ["Weight Loss", "Beginners"],
    rating: 4.9,
    reviews: 127,
    price: "KES 3,500/mo",
    clients: 24,
    bio: "Helping beginners build sustainable fitness habits for 8 years.",
    verified: true,
  },
  {
    id: "2",
    name: "Coach Faith W.",
    location: "Nairobi",
    avatar: "👩‍🏫",
    specialties: ["Home Workouts", "Women's Fitness"],
    rating: 4.8,
    reviews: 89,
    price: "KES 2,800/mo",
    clients: 31,
    bio: "No gym? No problem! Specializing in effective home workout programs.",
    verified: true,
  },
  {
    id: "3",
    name: "Coach David K.",
    location: "Mombasa",
    avatar: "🏋️",
    specialties: ["Gym", "Muscle Building"],
    rating: 4.7,
    reviews: 156,
    price: "KES 4,000/mo",
    clients: 18,
    bio: "Former competitive bodybuilder. Science-based approach to gains.",
    verified: true,
  },
  {
    id: "4",
    name: "Coach Anne M.",
    location: "Kisumu",
    avatar: "🏃‍♀️",
    specialties: ["Running", "Marathon Training"],
    rating: 4.9,
    reviews: 72,
    price: "KES 3,000/mo",
    clients: 15,
    bio: "Marathon finisher and running coach. From couch to 5K and beyond!",
    verified: true,
  },
  {
    id: "5",
    name: "Coach Peter N.",
    location: "Nakuru",
    avatar: "💪",
    specialties: ["Beginners", "Lifestyle Coaching"],
    rating: 4.6,
    reviews: 45,
    price: "KES 2,500/mo",
    clients: 28,
    bio: "Lost 30kg myself. I understand the journey and I'm here to guide you.",
    verified: false,
  },
  {
    id: "6",
    name: "Coach Lucy A.",
    location: "Eldoret",
    avatar: "🧘‍♀️",
    specialties: ["Yoga", "Flexibility"],
    rating: 4.8,
    reviews: 63,
    price: "KES 2,200/mo",
    clients: 22,
    bio: "Yoga instructor bringing mindful movement to your fitness journey.",
    verified: true,
  },
];

const specialtyFilters = [
  { id: "all", label: "All", icon: Users },
  { id: "beginners", label: "Beginners", icon: Star },
  { id: "weight-loss", label: "Weight Loss", icon: Scale },
  { id: "gym", label: "Gym", icon: Dumbbell },
  { id: "home", label: "Home Workouts", icon: HomeIcon },
  { id: "running", label: "Running", icon: PersonStanding },
];

export default function TrainersPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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

        {/* Trainers Grid */}
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
                    <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center text-3xl shrink-0">
                      {trainer.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg truncate">{trainer.name}</h3>
                        {trainer.verified && (
                          <span className="text-primary text-sm">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{trainer.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trainer.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {trainer.bio}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-streak fill-streak" />
                      <span className="font-bold">{trainer.rating}</span>
                      <span className="text-sm text-muted-foreground">({trainer.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{trainer.clients} clients</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4 p-3 rounded-xl bg-muted text-center">
                    <p className="text-sm text-muted-foreground">Starting at</p>
                    <p className="text-xl font-bold text-primary">{trainer.price}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

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
              <Link href="/register?role=trainer">Apply to be a Coach</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
