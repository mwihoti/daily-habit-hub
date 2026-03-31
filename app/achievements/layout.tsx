import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fittribe.co.ke";

export const metadata: Metadata = {
  title: "Fitness Achievements & Rewards | FitTribe Nairobi",
  description:
    "Earn NFT badges and $HABIT tokens for your workout milestones. The fitness rewards platform built for Nairobi.",
  alternates: { canonical: `${siteUrl}/achievements` },
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
