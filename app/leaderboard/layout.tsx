import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Fitness Leaderboard Nairobi | Top Workout Streaks on FitTribe",
  description:
    "See the top workout streaks in Nairobi on FitTribe. Explore community rankings, daily consistency leaders, and the most active fitness members.",
  keywords: [
    "fitness leaderboard Nairobi",
    "workout streak leaderboard Kenya",
    "fitness challenge Nairobi",
    "top workout streaks Nairobi",
    "FitTribe leaderboard",
  ],
  path: "/leaderboard",
});

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
