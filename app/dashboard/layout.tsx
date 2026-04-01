import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-habit-hub.vercel.app";

export const metadata: Metadata = {
  title: "My Fitness Dashboard | Daily Workout Tracker Nairobi",
  description:
    "Track your daily workouts, monitor streaks, earn $HABIT tokens and stay consistent. Your personal fitness hub for Nairobi.",
  alternates: { canonical: `${siteUrl}/dashboard` },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
