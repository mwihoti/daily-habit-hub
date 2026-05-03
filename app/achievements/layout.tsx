import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fitness Achievements & Rewards | FitTribe Nairobi",
  description:
    "Earn NFT badges and $HABIT tokens for your workout milestones. The fitness rewards platform built for Nairobi.",
  alternates: { canonical: absoluteUrl("/achievements") },
  robots: { index: false, follow: false },
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
