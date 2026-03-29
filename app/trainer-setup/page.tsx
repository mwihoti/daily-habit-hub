'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, MapPin, Briefcase, DollarSign, Languages, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const SPECIALTY_OPTIONS = [
  "Weight Loss",
  "Muscle Building",
  "Beginners",
  "Home Workouts",
  "Gym",
  "Running",
  "Marathon Training",
  "Yoga",
  "Flexibility",
  "Women's Fitness",
  "Men's Fitness",
  "Post-Pregnancy",
  "Lifestyle Coaching",
  "Nutrition",
  "HIIT",
  "Cardio",
];

const LANGUAGE_OPTIONS = ["English", "Swahili", "French", "Arabic", "Kikuyu", "Luo", "Kamba"];

export default function TrainerSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [availability, setAvailability] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [groupPriceMonthly, setGroupPriceMonthly] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleLanguage = (l: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!bio.trim()) {
      toast.error("Please write a short bio");
      return;
    }
    if (!location.trim()) {
      toast.error("Please enter your location");
      return;
    }
    if (selectedSpecialties.length === 0) {
      toast.error("Select at least one specialty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/trainers/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          bio: bio.trim(),
          location: location.trim(),
          experience_years: parseInt(experienceYears) || 0,
          availability: availability.trim() || null,
          price_monthly: parseInt(priceMonthly) || 0,
          group_price_monthly: parseInt(groupPriceMonthly) || 0,
          specialties: selectedSpecialties,
          languages: selectedLanguages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save profile");
        return;
      }

      toast.success("Profile created! 🎉", {
        description: "Your trainer profile is now live on FitTribe.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Something went wrong: " + (err?.message ?? "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-8 animate-slide-up">
          <div className="text-4xl mb-3">🎓</div>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Trainer Profile</h1>
          <p className="text-muted-foreground">
            Help clients find you. This takes about 3 minutes.
          </p>
        </div>

        <div className="space-y-6 animate-fade-in">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold text-lg">Basic Information</h2>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name / Display Name</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Coach Michael O."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Nairobi, Kenya"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About You</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell potential clients about your background, approach, and what makes you different..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-1">
                <Tag className="w-4 h-4 inline mr-1" />
                Specialties
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select all that apply
              </p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    disabled={isLoading}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                      selectedSpecialties.includes(s)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">
                <Languages className="w-4 h-4 inline mr-1" />
                Languages You Coach In
              </h2>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLanguage(l)}
                    disabled={isLoading}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                      selectedLanguages.includes(l)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold text-lg">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Pricing (KES per month)
              </h2>
              <p className="text-sm text-muted-foreground -mt-2">
                You can change these anytime. Leave blank to show "Contact for pricing".
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">1-on-1 Coaching</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="3500"
                      value={priceMonthly}
                      onChange={(e) => setPriceMonthly(e.target.value)}
                      className="pl-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupPrice">Group Coaching</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                    <Input
                      id="groupPrice"
                      type="number"
                      min="0"
                      placeholder="1500"
                      value={groupPriceMonthly}
                      onChange={(e) => setGroupPriceMonthly(e.target.value)}
                      className="pl-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="availability">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Availability (optional)
                </Label>
                <Input
                  id="availability"
                  placeholder="e.g. Mon-Fri, 6am-9pm EAT"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Saving profile...
              </>
            ) : (
              <>
                Go Live on FitTribe
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground pb-8">
            You can update your profile anytime from your{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              dashboard
            </Link>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
}
