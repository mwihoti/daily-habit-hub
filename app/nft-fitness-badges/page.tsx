import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "NFT Fitness Badges | Soulbound Workout Achievements on FitTribe",
  description:
    "FitTribe uses soulbound NFT fitness badges to represent workout milestones, consistency streaks, and wallet-linked proof of progress.",
  keywords: [
    "nft fitness badges",
    "soulbound nft badges",
    "nft badge fitness achievements",
    "web3 fitness community platform",
    "blockchain fitness tracking",
  ],
  path: "/nft-fitness-badges",
});

export default function NftFitnessBadgesPage() {
  return (
    <SeoLandingPage
      eyebrow="NFT fitness badges"
      title="Milestone badges tied to real workout progress"
      description="FitTribe uses soulbound NFT fitness badges to give major consistency milestones a clearer form of proof. The goal is to turn effort into something visible, not just another hidden app stat."
      sections={[
        {
          title: "What soulbound fitness badges mean",
          body: [
            "A soulbound badge is intended to stay attached to the user rather than circulate like a normal collectible. In the FitTribe context, that makes the badge feel closer to a proof-of-effort marker than a tradable item.",
            "For users searching for NFT fitness badges, that distinction matters. The badge is meant to reflect consistency, not speculation.",
          ],
        },
        {
          title: "Why badges still matter in a habit app",
          body: [
            "Milestones create moments of reinforcement inside a routine that can otherwise feel repetitive. A badge gives a user a visible marker that their streak or check-in history has crossed an important threshold.",
            "That works best when the badges sit alongside a daily system of check-ins, community support, and progress tracking.",
          ],
        },
        {
          title: "How badges fit the wider FitTribe model",
          body: [
            "On FitTribe, badges sit inside a larger system that includes habit tracking, trainer discovery, and blockchain fitness rewards. They are not the entire product; they are one reinforcing part of a consistency-focused loop.",
          ],
        },
      ]}
      links={[
        {
          href: "/blockchain-fitness-rewards",
          title: "Blockchain reward system",
          description: "Understand the reward layer that surrounds milestone badges.",
        },
        {
          href: "/fitness-habit-tracker",
          title: "Habit tracker",
          description: "See how milestones relate to everyday consistency.",
        },
        {
          href: "/community",
          title: "Community feed",
          description: "Explore the accountability environment around achievements.",
        },
      ]}
    />
  );
}
