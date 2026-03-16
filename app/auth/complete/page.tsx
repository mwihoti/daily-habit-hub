'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Landing page for Google OAuth new users.
// Reads the role saved to localStorage before the OAuth redirect,
// then routes them to the correct dashboard.
export default function AuthCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No session — something went wrong, send to login
        router.replace("/login?error=auth_error&message=Session+not+found+after+OAuth");
        return;
      }

      // Read role that was saved before the Google redirect
      const role = localStorage.getItem("pending_signup_role") ?? "user";
      localStorage.removeItem("pending_signup_role");

      // Redirect based on role
      router.replace(role === "trainer" ? "/dashboard" : "/check-in");
    };

    finish();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Completing sign in…</p>
      </div>
    </div>
  );
}
