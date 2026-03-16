'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [role, setRole] = useState<"user" | "trainer">("user");

  const handleEmailRegister = async () => {
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: name.trim(),
          role,
        }),
      });

      const payload = await response.json().catch(() => null);
      const data = {
        user: payload?.user,
        session: payload?.session,
      };

      if (!response.ok) {
        toast.error(payload?.error || "Could not create account");
        return;
      }

      if (data?.user && data.user.identities?.length === 0) {
        toast.error("An account with this email already exists. Please log in.");
        return;
      }

      if (data?.user && !data?.session) {
        toast.success("Check your email! 📬", {
          description: "We sent you a confirmation link. Click it to activate your account.",
          duration: 8000,
        });
        router.push("/login");
        return;
      }

      if (data?.session) {
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          toast.error(sessionError.message || "Could not persist login session");
          return;
        }

        toast.success("Account created! 🎉", {
          description:
            role === "trainer"
              ? "Welcome to FitTribe! Complete your trainer profile."
              : "Welcome to FitTribe! Let's start your fitness journey.",
        });
        router.push(role === "trainer" ? "/dashboard" : "/check-in");
        return;
      }
    } catch (err: any) {
      toast.error("Sign-up failed: " + (err?.message ?? "Unknown error"));
      console.error("Register error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      // Persist the selected role before leaving the page so the /auth/callback
      // handler can read it after Google redirects back.
      localStorage.setItem("pending_signup_role", role);

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/complete`,
          // Prevent the library from auto-redirecting so we can keep the
          // loading state visible until the browser actually navigates away.
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        localStorage.removeItem("pending_signup_role");
        toast.error(error.message);
        setIsGoogleLoading(false);
        return;
      }

      if (data?.url) {
        // Navigate to Google — button stays in loading state until the page unloads.
        window.location.assign(data.url);
      } else {
        localStorage.removeItem("pending_signup_role");
        toast.error("Could not start Google sign-up. Please try again.");
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      localStorage.removeItem("pending_signup_role");
      toast.error("Google sign-up failed: " + (err?.message ?? "Unknown error"));
      console.error("Google OAuth error:", err);
      setIsGoogleLoading(false);
    }
  };

  const handleRoleSelect = (selected: "user" | "trainer") => {
    if (!isLoading && !isGoogleLoading) {
      setRole(selected);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
            <span className="font-bold text-2xl">FitTribe</span>
          </Link>
        </div>

        <Card className="animate-fade-in">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Join FitTribe</h1>
              <p className="text-muted-foreground">Start your consistency journey today</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                disabled={isLoading || isGoogleLoading}
                onClick={() => handleRoleSelect("user")}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all cursor-pointer z-10",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  role === "user"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-2xl mb-2 block">🏃</span>
                <span className="font-medium">I want to exercise</span>
              </button>
              <button
                type="button"
                disabled={isLoading || isGoogleLoading}
                onClick={() => handleRoleSelect("trainer")}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all cursor-pointer z-10",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  role === "trainer"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-2xl mb-2 block">🎓</span>
                <span className="font-medium">I&apos;m a trainer</span>
              </button>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6"
              onClick={handleGoogleRegister}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to Google…
                </>
              ) : (
                <>
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading || isGoogleLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEmailRegister();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="button"
                variant="hero"
                className="w-full"
                onClick={handleEmailRegister}
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}