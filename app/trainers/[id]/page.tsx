'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star, MapPin, Users, Calendar, MessageCircle, ArrowLeft,
  Loader2, Languages, Clock,
} from "lucide-react";
import { toast } from "sonner";

interface TrainerProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  specialties: string[];
  experience_years: number;
  languages: string[];
  availability: string | null;
  price_monthly: number;
  group_price_monthly: number;
  rating: number;
  review_count: number;
  client_count: number;
  is_verified: boolean;
}

function TrainerAvatar({ url, name, size = "lg" }: { url: string | null; name: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const cls = size === "lg"
    ? "w-24 h-24 md:w-32 md:h-32 rounded-2xl text-4xl md:text-5xl"
    : "w-10 h-10 rounded-full text-lg";

  if (url) {
    return <img src={url} alt={name} className={`${cls} object-cover shrink-0 mx-auto md:mx-0`} />;
  }
  return (
    <div className={`${cls} gradient-hero flex items-center justify-center font-bold text-primary-foreground shrink-0 mx-auto md:mx-0`}>
      {initials}
    </div>
  );
}

export default function TrainerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchTrainer() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/trainers/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Not found");
        setTrainer(data.trainer);
      } catch {
        toast.error("Trainer not found");
        router.push("/trainers");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrainer();
  }, [id, router]);

  const handleMessage = async () => {
    if (!trainer) return;
    setIsMessaging(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainer_user_id: trainer.user_id }),
      });
      const data = await res.json();

      if (res.status === 401) {
        toast.error("Please sign in to message this trainer");
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error(data.error);

      router.push(`/messages?conversation=${data.conversation.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not start conversation");
    } finally {
      setIsMessaging(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!trainer) return null;

  return (
    <Layout>
      <div className="container py-6 md:py-12 max-w-4xl">
        {/* Back */}
        <Link
          href="/trainers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to trainers
        </Link>

        {/* Profile Header */}
        <Card className="mb-6 animate-slide-up">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <TrainerAvatar url={trainer.avatar_url} name={trainer.full_name} size="lg" />

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{trainer.full_name}</h1>
                  {trainer.is_verified && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4 flex-wrap">
                  {trainer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{trainer.location}</span>
                    </div>
                  )}
                  {trainer.experience_years > 0 && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{trainer.experience_years} year{trainer.experience_years !== 1 ? "s" : ""} exp.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-streak fill-streak" />
                    <span className="font-bold text-lg">
                      {trainer.rating > 0 ? trainer.rating.toFixed(1) : "New"}
                    </span>
                    {trainer.review_count > 0 && (
                      <span className="text-muted-foreground">({trainer.review_count} reviews)</span>
                    )}
                  </div>
                  {trainer.client_count > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>{trainer.client_count} active clients</span>
                    </div>
                  )}
                </div>

                {trainer.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {trainer.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {trainer.bio && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-bold text-lg mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Languages & Availability */}
            {(trainer.languages.length > 0 || trainer.availability) && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  {trainer.languages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Languages className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold">Languages</h3>
                      </div>
                      <p className="text-muted-foreground">{trainer.languages.join(", ")}</p>
                    </div>
                  )}
                  {trainer.availability && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold">Availability</h3>
                      </div>
                      <p className="text-muted-foreground">{trainer.availability}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar — Pricing & CTA */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Coaching Plans</h2>

                {trainer.price_monthly > 0 && (
                  <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 mb-4">
                    <p className="text-sm text-muted-foreground">1-on-1 Coaching</p>
                    <p className="text-2xl font-bold text-primary">
                      KES {trainer.price_monthly.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-muted-foreground">Personalized attention</p>
                  </div>
                )}

                {trainer.group_price_monthly > 0 && (
                  <div className="p-4 rounded-xl border border-border mb-6">
                    <p className="text-sm text-muted-foreground">Group Coaching</p>
                    <p className="text-2xl font-bold">
                      KES {trainer.group_price_monthly.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-muted-foreground">Join a community</p>
                  </div>
                )}

                {trainer.price_monthly === 0 && trainer.group_price_monthly === 0 && (
                  <p className="text-muted-foreground text-sm mb-6">
                    Message this trainer for pricing details.
                  </p>
                )}

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleMessage}
                  disabled={isMessaging}
                >
                  {isMessaging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                  Message {trainer.full_name.split(" ")[0]}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
