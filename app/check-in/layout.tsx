import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-habit-hub.vercel.app";

export const metadata: Metadata = {
  title: "Daily Workout Check-In | FitTribe Nairobi",
  description:
    "Log today's workout with one tap and earn $HABIT tokens. Daily accountability for Nairobi fitness enthusiasts.",
  alternates: { canonical: `${siteUrl}/check-in` },
  robots: { index: false, follow: false },
};

export default function CheckInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
