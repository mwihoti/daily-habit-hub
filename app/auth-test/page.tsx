'use client';

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthTest() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLog((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} → ${msg}`]);
  };

  const testEnvVars = () => {
    addLog(`SUPABASE_URL = ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "❌ MISSING"}`);
    addLog(`ANON_KEY = ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ present (" + String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).slice(0, 15) + "...)" : "❌ MISSING"}`);
  };

  const testSignUp = async () => {
    addLog("Starting email signup test...");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      addLog("Supabase client created ✅");
      const { data, error } = await supabase.auth.signUp({
        email: `test${Date.now()}@proton.me`,
        password: "TestPassword123!",
      });
      if (error) {
        addLog(`❌ SignUp error: ${error.message} (code: ${error.status})`);
      } else {
        addLog(`✅ SignUp success! User ID: ${data.user?.id}`);
      }
    } catch (err: any) {
      addLog(`💥 Exception: ${err?.message}`);
    }
  };

  const testGoogle = async () => {
    addLog("Starting Google OAuth test...");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      addLog("Supabase client created ✅");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        addLog(`❌ Google OAuth error: ${error.message}`);
      } else {
        addLog(`✅ Google OAuth initiated. Redirect URL: ${data.url?.slice(0, 60)}...`);
        addLog("→ Browser should redirect to Google now...");
      }
    } catch (err: any) {
      addLog(`💥 Exception: ${err?.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>🔬 Supabase Auth Diagnostic</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button
          onClick={testEnvVars}
          style={{ padding: "0.75rem 1.5rem", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}
        >
          1. Check Env Vars
        </button>
        <button
          onClick={testSignUp}
          style={{ padding: "0.75rem 1.5rem", background: "#059669", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}
        >
          2. Test Email Signup
        </button>
        <button
          onClick={testGoogle}
          style={{ padding: "0.75rem 1.5rem", background: "#dc2626", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}
        >
          3. Test Google OAuth
        </button>
        <button
          onClick={() => setLog([])}
          style={{ padding: "0.75rem 1.5rem", background: "#6b7280", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}
        >
          Clear
        </button>
      </div>

      <div style={{ background: "#111", color: "#22c55e", padding: "1.5rem", borderRadius: "8px", minHeight: "300px" }}>
        {log.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Click a button above to run a test...</p>
        ) : (
          log.map((line, i) => (
            <div key={i} style={{ marginBottom: "0.25rem" }}>{line}</div>
          ))
        )}
      </div>

      <p style={{ marginTop: "1rem", color: "#6b7280", fontSize: "0.85rem" }}>
        Results also logged to browser Console (F12 → Console tab)
      </p>
    </div>
  );
}
