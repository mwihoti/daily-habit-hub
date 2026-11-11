import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Streak Leaderboard | Longest Daily Streaks on FitTribe",
  description:
    "See who is holding the longest daily streaks on FitTribe. Public rankings of the most consistent members, updated through the day.",
  keywords: [
    "streak leaderboard",
    "habit streak ranking",
    "workout streak leaderboard",
    "consistency leaderboard",
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
