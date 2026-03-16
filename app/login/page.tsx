'use client';

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Isolated into its own component so useSearchParams sits inside a Suspense
// boundary — required by Next 16 / React 19 to avoid defer-hydration issues
// that silently freeze all event handlers on the page.
function AuthErrorBanner() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const authErrorCode = searchParams.get("code");
  const authErrorMessage = searchParams.get("message");

  if (!authError) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication failed</AlertTitle>
      <AlertDescription>
        {authErrorMessage ?? "We could not complete sign-in. Check your provider and redirect URL settings."}
        {authErrorCode ? ` (code: ${authErrorCode})` : ""}
      </AlertDescription>
    </Alert>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // createClient is only called inside event handlers (runs in browser only)
  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error || "Invalid email or password");
        return;
      }

      if (!payload?.session) {
        toast.error("Login succeeded but no session was returned");
        return;
      }

      // Keep browser auth state in sync with server route result.
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.session.access_token,
        refresh_token: payload.session.refresh_token,
      });

      if (sessionError) {
        toast.error(sessionError.message || "Could not persist login session");
        return;
      }

      toast.success("Welcome back! 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Auth error: " + (err?.message ?? "Unknown error"));
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Prevent the library from auto-redirecting so we can keep the
          // loading state visible until the browser actually navigates away.
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        toast.error(error.message);
        setIsGoogleLoading(false);
        return;
      }

      if (data?.url) {
        // Navigate to Google — button stays in loading state until the page unloads.
        window.location.assign(data.url);
      } else {
        toast.error("Could not start Google sign-in. Please try again.");
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      toast.error("Google sign-in failed: " + (err?.message ?? "Unknown error"));
      console.error("Google OAuth error:", err);
      setIsGoogleLoading(false);
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
              <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
              <p className="text-muted-foreground">Sign in to continue your journey</p>
            </div>

            <Suspense fallback={null}>
              <AuthErrorBanner />
            </Suspense>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6"
              onClick={handleGoogleSignIn}
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

            {/* Email inputs — no <form> tag */}
            <div className="space-y-4">
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading || isGoogleLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEmailLogin();
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

              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="button"
                variant="hero"
                className="w-full"
                onClick={handleEmailLogin}
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
