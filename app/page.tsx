'use client';
export const dynamic = 'force-dynamic';

/**
 * FitTribe marketing landing — dark, goal-neutral, global.
 * Design source: docs/landing mockup. Palette: bg #0a0a0b, cards #17171b,
 * borders #26262c, headings #f5f5f4, body #a1a1aa, orange #f97316→#fb923c
 * as a sharp accent only. Signed-in users are sent to /dashboard.
 */

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { JsonLd } from "@/components/JsonLd";

// ── Copy ─────────────────────────────────────────────────────────────────────

const GOAL_CHIPS = [
  { emoji: "💪", label: "Fitness" },
  { emoji: "📚", label: "Study" },
  { emoji: "💼", label: "Building a business" },
  { emoji: "🎨", label: "Your craft" },
  { emoji: "🔁", label: "Any daily habit" },
];

const REASSURANCES = ["Free forever", "No wallet setup", "No gas fees", "30 seconds to start"];

const HOW_IT_WORKS = [
  {
    num: "01",
    emoji: "✅",
    title: "Check in",
    body: "One tap logs today. Under 30 seconds. Your tribe sees you showed up.",
  },
  {
    num: "02",
    emoji: "🔥",
    title: "Build the streak",
    body: "Every day you show up, your streak grows. Break it and you start over — that's the point.",
  },
  {
    num: "03",
    emoji: "🪙",
    title: "Earn rewards",
    body: "Collect $HABIT for consistency. Real, on-chain, yours — no gas fees, no wallet hassle.",
  },
  {
    num: "04",
    emoji: "🏅",
    title: "Unlock badges",
    body: "Hit 7, 21, 30 & 49 days to mint streak badges you own forever. Proof you actually did it.",
  },
];

const FEATURES = [
  {
    emoji: "👥",
    title: "A tribe that notices",
    body: "A live community feed where people cheer your streak and feel it when you go quiet. You're never grinding alone.",
  },
  {
    emoji: "🏆",
    title: "Leaderboards & challenges",
    body: "Climb the rankings, join weekly challenges, and compete with friends. Consistency becomes a game you want to win.",
  },
  {
    emoji: "📊",
    title: "Smart insights",
    body: "A consistency score that spots momentum or drift early, detects your patterns, and nudges you before you slip.",
  },
  {
    emoji: "🪙",
    title: "Rewards for showing up",
    body: "Earn $HABIT every check-in. Tangible proof that discipline pays — capped supply, fully on-chain.",
  },
  {
    emoji: "🛡️",
    title: "Proof you can't fake",
    body: "Your streak is recorded on-chain. It's a track record you own and can show off — not a number in someone's database.",
  },
  {
    emoji: "⚡",
    title: "Zero crypto friction",
    body: "A wallet is created for you in the background. No MetaMask, no seed phrases, no gas fees. It just works.",
  },
];

const TRUST_CHIPS = [
  "🪙 10 $HABIT / check-in",
  "🏅 Ownable streak NFTs",
  "✓ No gas fees",
  "✓ No MetaMask",
  "✓ Self-custodial",
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      question: "What is FitTribe?",
      answer:
        "FitTribe is a streak accountability app for any goal — fitness, study, building a business, or any daily habit. You check in daily, build a streak with a community that notices, and earn on-chain rewards for consistency.",
    },
    {
      question: "How does FitTribe work?",
      answer:
        "Pick your goal and check in once a day. Your streak grows, your tribe sees it, and eligible check-ins are recorded on-chain and rewarded with $HABIT tokens and streak badges.",
    },
    {
      question: "Is FitTribe free to use?",
      answer:
        "Yes. FitTribe is free, and it covers all blockchain fees — you never pay gas for your streak to be recorded on-chain.",
    },
    {
      question: "Do I need MetaMask or crypto knowledge to use FitTribe?",
      answer:
        "No. A self-custodial wallet is created for you in the background. No MetaMask, no seed phrases — it feels like any other app.",
    },
    {
      question: "What are streak badges?",
      answer:
        "Milestone-based, soulbound achievement badges minted at 7, 21, 30 and 49 days. They stay tied to your wallet as proof of consistency you own.",
    },
  ].map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

// ── Shared bits ──────────────────────────────────────────────────────────────

const XHARE_URL =
  "https://x.com/intent/post?text=" +
  encodeURIComponent("Show up. Stay consistent. Prove it on-chain. 🔥 fittribe.club");
const REDDIT_URL = "https://www.reddit.com/submit?url=https%3A%2F%2Fdaily-habit-hub.vercel.app";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center text-base">
        🔥
      </div>
      <span className="font-display font-bold text-lg tracking-tight text-[#f5f5f4]">FitTribe</span>
    </Link>
  );
}

function PrimaryCta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/register"
      className={
        "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] " +
        "px-6 py-3 text-sm font-bold text-[#0a0a0b] shadow-[0_0_24px_rgba(249,115,22,0.35)] " +
        "hover:opacity-90 transition-opacity " +
        className
      }
    >
      {children}
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const supabase = createClient();
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // The marketing page is for visitors — members land on their dashboard
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  // Live founding-member count
  const { data: memberCount } = useQuery({
    queryKey: ["platform-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  const joined = memberCount ?? null;
  const spotsLeft = joined === null ? null : Math.max(0, 100 - joined);
  const pct = joined === null ? 0 : Math.min(100, joined);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#a1a1aa] [&_*]:scroll-mt-24">
      <JsonLd schema={faqSchema} />

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-[#26262c] bg-[#0a0a0b]/90 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <a href="#how-it-works" className="px-3 py-2 rounded-full hover:text-[#f5f5f4] transition-colors">How it works</a>
            <a href="#features" className="px-3 py-2 rounded-full hover:text-[#f5f5f4] transition-colors">Features</a>
            <a href="#rewards" className="px-3 py-2 rounded-full hover:text-[#f5f5f4] transition-colors">Rewards</a>
            <Link href="/login" className="ml-1 px-4 py-1.5 rounded-full border border-[#26262c] text-[#f5f5f4] hover:border-[#3f3f46] transition-colors">
              Open app
            </Link>
          </nav>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] px-4 py-1.5 text-sm font-bold text-[#0a0a0b] hover:opacity-90 transition-opacity"
          >
            Start free
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px] rounded-full bg-[#f97316]/10 blur-[120px]" />
        <div className="container grid items-center gap-12 py-14 md:py-20 lg:grid-cols-2">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-3.5 py-1.5 text-xs font-semibold text-[#fb923c]">
              🔥 Founding-member access — first 100 spots
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#f5f5f4] sm:text-5xl md:text-6xl">
              Chase your goal.
              <br />
              Keep your streak.
              <br />
              <span className="text-[#f97316]">Prove you showed up.</span>
            </h1>

            <p className="max-w-xl text-base md:text-lg leading-relaxed">
              FitTribe keeps ambitious people consistent on the goals that actually matter.
              Pick your goal, show up every day, and hold the streak with a tribe that
              won&apos;t let you quit — and earn rewards for proving you did the work.
            </p>

            <div className="flex flex-wrap gap-2">
              {GOAL_CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#26262c] bg-[#17171b] px-3 py-1.5 text-xs font-semibold text-[#d4d4d8]"
                >
                  <span>{chip.emoji}</span> {chip.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <PrimaryCta>
                Start your streak — free <ArrowRight className="h-4 w-4" />
              </PrimaryCta>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-[#26262c] bg-[#17171b] px-6 py-3 text-sm font-bold text-[#f5f5f4] hover:border-[#3f3f46] transition-colors"
              >
                See how it works
              </a>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs font-medium">
              {REASSURANCES.map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" /> {r}
                </span>
              ))}
            </div>
          </div>

          {/* Right — phone mockup (illustrative numbers) */}
          <div className="relative mx-auto w-full max-w-[340px]">
            <div className="pointer-events-none absolute inset-0 -z-10 translate-y-8 rounded-full bg-[#f97316]/15 blur-[90px]" />
            <div className="rounded-[2.5rem] border border-[#26262c] bg-[#101013] p-3 shadow-2xl">
              <div className="space-y-4 rounded-[2rem] border border-[#26262c] bg-[#0d0d0f] p-5">
                {/* header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#fb923c] text-sm font-bold text-[#0a0a0b]">
                      D
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#f5f5f4]">Daniel</p>
                      <p className="text-[10px] text-[#71717a]">Level 4 · Consistent</p>
                    </div>
                  </div>
                  <span className="text-lg">🏆</span>
                </div>

                {/* streak card */}
                <div className="rounded-2xl border border-[#f97316]/30 bg-gradient-to-b from-[#1c1410] to-[#17171b] p-5 text-center">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-[#fb923c]">
                    ● LAUNCH MY STARTUP
                  </p>
                  <p className="mt-2 text-4xl">🔥</p>
                  <p className="font-display text-5xl font-extrabold text-[#f5f5f4]">21</p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-[#71717a]">DAY STREAK</p>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] py-2.5 text-center text-sm font-bold text-[#0a0a0b]">
                  ✓ Check in for today
                </div>

                {/* tiles */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#26262c] bg-[#17171b] p-3 text-center">
                    <p className="text-lg font-extrabold text-[#f5f5f4]">+10</p>
                    <p className="text-[9px] font-semibold tracking-wider text-[#71717a]">$HABIT EARNED</p>
                  </div>
                  <div className="rounded-xl border border-[#26262c] bg-[#17171b] p-3 text-center">
                    <p className="text-lg font-extrabold text-[#f5f5f4]">#8</p>
                    <p className="text-[9px] font-semibold tracking-wider text-[#71717a]">LEADERBOARD</p>
                  </div>
                </div>

                {/* badges */}
                <div>
                  <p className="mb-2 text-[9px] font-semibold tracking-[0.2em] text-[#71717a]">STREAK BADGES</p>
                  <div className="flex gap-2">
                    {["🔥", "🏅", "🥇", "💎"].map((b, i) => (
                      <div
                        key={b}
                        className={
                          "flex h-9 w-9 items-center justify-center rounded-lg border text-base " +
                          (i < 2
                            ? "border-[#f97316]/40 bg-[#f97316]/10"
                            : "border-[#26262c] bg-[#17171b] opacity-40")
                        }
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founding members ── */}
      <section className="border-y border-[#26262c] bg-[#101013]">
        <div className="container max-w-3xl py-10 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-[#f97316]">FOUNDING MEMBERS</p>
          <h2 className="mt-2 font-display text-xl font-bold text-[#f5f5f4] md:text-2xl">
            Be one of the first 100 to build on FitTribe
          </h2>
          <div className="mx-auto mt-5 max-w-xl">
            <div className="h-2 overflow-hidden rounded-full bg-[#26262c]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="font-bold text-[#f5f5f4]">{joined === null ? "—" : `${joined} joined`}</span>
              <span>{spotsLeft === null ? "" : `${spotsLeft} spots left`}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-[#f97316]">HOW IT WORKS</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#f5f5f4] md:text-4xl">
            Four taps to a goal that sticks
          </h2>
          <p className="mt-4 leading-relaxed">
            Whatever you&apos;re working toward — a fitter body, a business, a degree, a new skill
            — the loop is the same. Just show up. FitTribe makes it rewarding and impossible to fake.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.num} className="relative rounded-2xl border border-[#26262c] bg-[#17171b] p-6">
              <span className="absolute right-5 top-5 text-xs font-bold text-[#3f3f46]">{step.num}</span>
              <span className="text-2xl">{step.emoji}</span>
              <h3 className="mt-3 font-display text-base font-bold text-[#f5f5f4]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-y border-[#26262c] bg-[#101013]">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.25em] text-[#f97316]">WHY IT WORKS</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#f5f5f4] md:text-4xl">
              Accountability beats willpower
            </h2>
            <p className="mt-4 leading-relaxed">
              Every other habit app leaves you alone with a checkbox. FitTribe puts a tribe,
              a scoreboard, and real stakes behind every day you show up.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-[#26262c] bg-[#17171b] p-6">
                <span className="text-2xl">{f.emoji}</span>
                <h3 className="mt-3 font-display text-base font-bold text-[#f5f5f4]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rewards (kept low on the page by design) ── */}
      <section id="rewards" className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#26262c] bg-[#101013] px-6 py-12 text-center md:px-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#26262c] bg-[#17171b] px-3.5 py-1.5 text-xs font-semibold text-[#d4d4d8]">
            🔺 Powered by Avalanche
          </div>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#f5f5f4] md:text-4xl">
            Your consistency, finally worth something
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed">
            Most habit apps give you a green checkmark and nothing else. FitTribe turns
            every day you show up into rewards you actually own — $HABIT tokens and
            streak badges recorded on-chain. We handle all the crypto behind the scenes,
            so it feels like any other app.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#26262c] bg-[#17171b] px-3.5 py-1.5 text-xs font-semibold text-[#d4d4d8]"
              >
                {chip}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-xl text-xs text-[#71717a]">
            $HABIT is FitTribe&apos;s reward token, minted for every check-in — your on-chain
            record of consistency. It currently has no monetary value.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="container pb-20 pt-4 text-center md:pb-28">
        <p className="text-xs font-bold tracking-[0.25em] text-[#f97316]">START TODAY</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#f5f5f4] md:text-4xl">
          Your streak starts with one tap
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed">
          Free forever. Nothing to install to try it. Show up today — and let the tribe
          carry you the rest of the way.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryCta>
            Start your streak — free <ArrowRight className="h-4 w-4" />
          </PrimaryCta>
          <a
            href={XHARE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#26262c] bg-[#17171b] px-6 py-3 text-sm font-bold text-[#f5f5f4] hover:border-[#3f3f46] transition-colors"
          >
            <Star className="h-4 w-4 text-[#f97316]" /> Star on X
          </a>
        </div>
        <p className="mt-6 text-xs text-[#71717a]">
          fittribe.club · Show up. Stay consistent. Prove it on-chain.
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#26262c]">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-xs md:flex-row">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-medium">
            <a href="#how-it-works" className="hover:text-[#f5f5f4] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#f5f5f4] transition-colors">Features</a>
            <a href="#rewards" className="hover:text-[#f5f5f4] transition-colors">Rewards</a>
            <a href={XHARE_URL} target="_blank" rel="noreferrer" className="hover:text-[#f5f5f4] transition-colors">X / Twitter</a>
            <a href={REDDIT_URL} target="_blank" rel="noreferrer" className="hover:text-[#f5f5f4] transition-colors">Reddit</a>
          </nav>
          <p className="text-[#71717a]">© 2026 FitTribe · fittribe.club</p>
        </div>
      </footer>
    </div>
  );
}
