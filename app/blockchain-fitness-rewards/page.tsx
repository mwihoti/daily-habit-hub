import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "Blockchain Fitness Rewards | How FitTribe Rewards Workout Consistency",
  description:
    "Learn how FitTribe uses Avalanche for blockchain fitness rewards, check-in recording, and proof of consistency tied to workout habits.",
  keywords: [
    "blockchain fitness rewards",
    "avalanche fitness platform",
    "crypto rewards for working out",
    "blockchain fitness tracking",
    "zero-fee blockchain fitness app",
  ],
  path: "/blockchain-fitness-rewards",
});

export default function BlockchainFitnessRewardsPage() {
  return (
    <SeoLandingPage
      eyebrow="Blockchain fitness rewards"
      title="Rewarding consistency with verifiable workout history"
      description="FitTribe uses Avalanche to support blockchain fitness rewards and on-chain progress recording for eligible workout activity, while keeping the user experience focused on simple daily habits."
      sections={[
        {
          title: "Why put fitness rewards on-chain",
          body: [
            "Blockchain fitness rewards create a record that is harder to fake, easier to verify, and more portable than app-only systems. That makes consistency feel more durable and transparent.",
            "For users, the value is not just novelty. It is the combination of habit tracking, visible proof, and a reward model that lives beyond a closed database.",
          ],
        },
        {
          title: "How FitTribe approaches the reward model",
          body: [
            "The app starts with the daily check-in experience. When the wallet and reward flow are available, eligible activity can be recorded through the platform without pushing blockchain complexity onto the user.",
            "That is why the product can appeal to people searching for blockchain fitness tracking without becoming unusable for everyone else.",
          ],
        },
        {
          title: "What this means for accountability",
          body: [
            "A public record of consistency reinforces the accountability side of the app. Combined with streaks, community visibility, and milestone badges, the reward layer becomes part of a broader system for routine-building.",
          ],
        },
      ]}
      links={[
        {
          href: "/crypto-fitness-app",
          title: "Crypto fitness app overview",
          description: "See the product from the broader wallet-and-rewards angle.",
        },
        {
          href: "/community",
          title: "Community accountability",
          description: "Understand how public motivation supports the rewards layer.",
        },
        {
          href: "/leaderboard",
          title: "Streak rankings",
          description: "View consistency as a public ranking system.",
        },
      ]}
    />
  );
}
