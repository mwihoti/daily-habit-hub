'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowRight, ArrowLeft, MapPin, Briefcase, DollarSign,
  Languages, Clock, Tag, Award, GraduationCap, Camera,
  Plus, X, CheckCircle, User, Instagram, Youtube, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Options ─────────────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
  "Weight Loss", "Muscle Building", "Beginners", "Home Workouts",
  "Gym", "Running", "Marathon Training", "Yoga", "Flexibility",
  "Women's Fitness", "Men's Fitness", "Post-Pregnancy",
  "Lifestyle Coaching", "Nutrition", "HIIT", "Cardio", "Powerlifting",
  "CrossFit", "Pilates", "Mobility", "Sports Performance",
];

const LANGUAGE_OPTIONS = ["English", "Swahili", "French", "Arabic", "Kikuyu", "Luo", "Kamba", "Spanish", "Portuguese"];

const CERTIFICATION_SUGGESTIONS = [
  "ACE Certified Personal Trainer",
  "NASM Certified Personal Trainer",
  "ISSA Certified Personal Trainer",
  "CSCS (NSCA)",
  "CrossFit Level 1",
  "CrossFit Level 2",
  "RYT 200 (Yoga)",
  "RYT 500 (Yoga)",
  "Precision Nutrition Level 1",
  "Precision Nutrition Level 2",
  "Kettlebell Instructor",
  "TRX Certified",
];

const TRAINING_STYLES = [
  { id: "structured", emoji: "📋", label: "Structured Programs", sub: "Detailed plans & schedules" },
  { id: "flexible", emoji: "🔄", label: "Flexible Approach", sub: "Adapt to the client daily" },
  { id: "accountability", emoji: "🎯", label: "Accountability Focus", sub: "Check-ins & habit tracking" },
  { id: "performance", emoji: "⚡", label: "Performance Based", sub: "Goals & measurable results" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: "Profile", icon: User },
  { label: "Qualifications", icon: Award },
  { label: "Specialties", icon: Tag },
  { label: "Pricing", icon: DollarSign },
  { label: "Review", icon: CheckCircle },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrainerSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Step 1 — Profile
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");

  // Step 2 — Qualifications
  const [experienceYears, setExperienceYears] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [education, setEducation] = useState("");
  const [selectedTrainingStyle, setSelectedTrainingStyle] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);

  // Step 3 — Specialties
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");

  // Step 4 — Pricing
  const [priceMonthly, setPriceMonthly] = useState("");
  const [groupPriceMonthly, setGroupPriceMonthly] = useState("");

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const addCert = (cert: string) => {
    const trimmed = cert.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications((prev) => [...prev, trimmed]);
    }
    setCertInput("");
  };

  const removeCert = (cert: string) =>
    setCertifications((prev) => prev.filter((c) => c !== cert));

  const toggleSpecialty = (s: string) =>
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const toggleLanguage = (l: string) =>
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ─── Validation per step ────────────────────────────────────────────────────

  const canProceed = () => {
    if (step === 1) return fullName.trim().length > 0 && bio.trim().length > 0 && location.trim().length > 0;
    if (step === 2) return experienceYears !== "" && selectedLanguages.length > 0;
    if (step === 3) return selectedSpecialties.length > 0;
    return true;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let avatar_url: string | null = null;

      // Upload avatar if provided
      if (avatarFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ext = avatarFile.name.split(".").pop();
          const path = `trainers/${user.id}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("workout-photos")
            .upload(path, avatarFile, { upsert: true });
          if (!upErr) {
            const { data: { publicUrl } } = supabase.storage
              .from("workout-photos")
              .getPublicUrl(path);
            avatar_url = publicUrl;
          }
        }
      }

      const res = await fetch("/api/trainers/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:            fullName.trim(),
          bio:                  bio.trim(),
          location:             location.trim(),
          experience_years:     parseInt(experienceYears) || 0,
          availability:         availability.trim() || null,
          price_monthly:        parseInt(priceMonthly) || 0,
          group_price_monthly:  parseInt(groupPriceMonthly) || 0,
          specialties:          selectedSpecialties,
          languages:            selectedLanguages,
          avatar_url,
          // extras stored in bio for now — future migration can add columns
          certifications_json:  JSON.stringify(certifications),
          education:            education.trim() || null,
          training_style:       selectedTrainingStyle,
          social_instagram:     instagram.trim() || null,
          social_youtube:       youtube.trim() || null,
          social_website:       website.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to save profile"); return; }

      toast.success("Application submitted! 🎉", {
        description: "Your trainer profile is now live on FitTribe.",
      });
      router.push("/trainers");
    } catch (err: any) {
      toast.error("Something went wrong: " + (err?.message ?? "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-3xl font-display font-bold mb-2">Apply to Coach on FitTribe</h1>
          <p className="text-muted-foreground">
            Tell us about your background. Applications go live immediately.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={s.label} className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  done   ? "bg-primary border-primary text-primary-foreground" :
                  active ? "border-primary text-primary bg-primary/10" :
                           "border-border text-muted-foreground"
                )}>
                  {done ? <CheckCircle className="w-4 h-4" /> : num}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  active ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground"
                )}>{s.label}</span>
              </div>
            );
          })}
          {/* connector lines */}
          <style>{`.step-line{position:absolute;top:18px;left:calc(50% + 20px);right:calc(-50% + 20px);height:2px}`}</style>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-8">
          <div
            className="h-1 gradient-hero rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="space-y-6 animate-fade-in">

          {/* ── STEP 1: Profile ── */}
          {step === 1 && (
            <>
              {/* Avatar upload */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Photo
                  </h2>
                  <div className="flex items-center gap-5">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors overflow-hidden shrink-0"
                    >
                      {avatarPreview
                        ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        : <Camera className="w-7 h-7 text-primary/60" />
                      }
                    </div>
                    <div>
                      <p className="font-medium mb-1">Upload a professional photo</p>
                      <p className="text-sm text-muted-foreground">JPG or PNG, max 5 MB. A clear face photo builds trust.</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                        Choose photo
                      </Button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                </CardContent>
              </Card>

              {/* Basic info */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-display font-bold text-lg">Basic Information</h2>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name / Coach Name *</Label>
                    <Input id="fullName" placeholder="e.g. Coach Michael O." value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location"><MapPin className="w-4 h-4 inline mr-1" />Location *</Label>
                    <Input id="location" placeholder="e.g. Nairobi, Kenya" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Your Bio *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell potential clients about your background, training philosophy, and what makes you the right coach for them. Be specific — mention your results, your approach, and who you work best with."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-[140px] resize-none"
                      maxLength={600}
                    />
                    <p className="text-xs text-muted-foreground text-right">{bio.length}/600</p>
                  </div>
                </CardContent>
              </Card>

              {/* Social links */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-display font-bold text-lg">Social Proof (optional)</h2>
                  <p className="text-sm text-muted-foreground -mt-2">Share links that showcase your work. Clients love to see real results.</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-pink-500 shrink-0" />
                      <Input aria-label="Instagram" placeholder="Instagram handle (e.g. @coach_mike)" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                      <Input placeholder="YouTube channel URL" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-500 shrink-0" />
                      <Input placeholder="Personal website or portfolio URL" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── STEP 2: Qualifications ── */}
          {step === 2 && (
            <>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Experience
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Coaching Experience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="e.g. 5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      Education / Degree (optional)
                    </Label>
                    <Input
                      id="education"
                      placeholder="e.g. BSc Sports Science, University of Nairobi"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Certifications & Credentials
                  </h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Add any fitness certifications you hold. Type your own or pick from suggestions.
                  </p>

                  {/* Add cert input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type certification name..."
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCert(certInput); } }}
                    />
                    <Button type="button" variant="outline" onClick={() => addCert(certInput)} disabled={!certInput.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                      {CERTIFICATION_SUGGESTIONS.filter((c) => !certifications.includes(c)).slice(0, 8).map((cert) => (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => addCert(cert)}
                          className="px-3 py-1 rounded-full text-xs border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          + {cert}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Added certifications */}
                  {certifications.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Your certifications:</p>
                      <div className="flex flex-wrap gap-2">
                        {certifications.map((cert) => (
                          <span
                            key={cert}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium"
                          >
                            <Award className="w-3 h-3 text-primary" />
                            {cert}
                            <button type="button" onClick={() => removeCert(cert)} className="ml-1 text-muted-foreground hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Training style */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-lg mb-4">Your Coaching Style</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {TRAINING_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedTrainingStyle(style.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all duration-200",
                          selectedTrainingStyle === style.id
                            ? "border-primary bg-primary/10 shadow-sm scale-[1.02]"
                            : "border-border hover:border-primary/40 hover:bg-muted"
                        )}
                      >
                        <span className="text-2xl block mb-2">{style.emoji}</span>
                        <span className="font-bold text-sm block">{style.label}</span>
                        <span className="text-xs text-muted-foreground">{style.sub}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    Languages You Coach In *
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => toggleLanguage(l)}
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
            </>
          )}

          {/* ── STEP 3: Specialties & Availability ── */}
          {step === 3 && (
            <>
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Your Specialties *
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select all areas where you coach. This is how clients find you.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialty(s)}
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
                  {selectedSpecialties.length > 0 && (
                    <p className="text-xs text-primary mt-3 font-medium">{selectedSpecialties.length} selected</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor="availability">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Availability (optional)
                    </Label>
                    <Input
                      id="availability"
                      placeholder="e.g. Mon–Fri, 6 am–9 pm EAT · Weekends by request"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Help clients know when they can expect responses and sessions.</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── STEP 4: Pricing ── */}
          {step === 4 && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Your Pricing (KES / month)
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave blank to show "Contact for pricing" on your profile.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">1-on-1 Coaching</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                      <Input id="price" type="number" min="0" placeholder="3500" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} className="pl-12" />
                    </div>
                    <p className="text-xs text-muted-foreground">Full personalised coaching</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupPrice">Group Coaching</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">KES</span>
                      <Input id="groupPrice" type="number" min="0" placeholder="1500" value={groupPriceMonthly} onChange={(e) => setGroupPriceMonthly(e.target.value)} className="pl-12" />
                    </div>
                    <p className="text-xs text-muted-foreground">Shared sessions / group plans</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted text-sm space-y-1">
                  <p className="font-medium">💡 Pricing tips</p>
                  <p className="text-muted-foreground">Average 1-on-1 coaching in Kenya: KES 3,000–8,000/mo. Group coaching: KES 1,000–2,500/mo. Price based on your experience and results.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── STEP 5: Review ── */}
          {step === 5 && (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6 space-y-5">
                <h2 className="font-display font-bold text-xl flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  Review Your Application
                </h2>

                {/* Profile preview */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover shrink-0" />
                    : <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0">
                        {fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                  }
                  <div>
                    <p className="font-display font-bold text-lg">{fullName}</p>
                    <p className="text-sm text-muted-foreground">{location}</p>
                    {experienceYears && <p className="text-xs text-primary font-medium">{experienceYears} years experience</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-muted-foreground text-xs font-medium mb-1">CERTIFICATIONS</p>
                    {certifications.length > 0
                      ? certifications.map((c) => <p key={c} className="font-medium text-xs">• {c}</p>)
                      : <p className="text-muted-foreground">None added</p>
                    }
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-muted-foreground text-xs font-medium mb-1">SPECIALTIES</p>
                    <p className="font-medium">{selectedSpecialties.slice(0, 3).join(", ")}{selectedSpecialties.length > 3 ? ` +${selectedSpecialties.length - 3}` : ""}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-muted-foreground text-xs font-medium mb-1">1-ON-1 PRICE</p>
                    <p className="font-medium">{priceMonthly ? `KES ${parseInt(priceMonthly).toLocaleString()}/mo` : "Contact for pricing"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-muted-foreground text-xs font-medium mb-1">LANGUAGES</p>
                    <p className="font-medium">{selectedLanguages.join(", ")}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs font-medium mb-1">BIO</p>
                  <p className="text-sm">{bio}</p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
                  <p className="font-medium text-primary mb-1">Your profile will be live immediately.</p>
                  <p className="text-muted-foreground">Clients can find and message you right away. You can edit everything from your dashboard.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2 pb-10">
            {step > 1 && (
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep((s) => s - 1)} disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {step < STEPS.length ? (
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="hero"
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />Submitting...</>
                ) : (
                  <>Go Live on FitTribe <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
