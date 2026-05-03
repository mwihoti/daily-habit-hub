import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = buildPublicMetadata({
  title: "Crypto Fitness App | FitTribe Workout Tracking and Rewards",
  description:
    "FitTribe is a crypto fitness app that combines workout tracking, streaks, community accountability, and wallet-based rewards on Avalanche.",
  keywords: [
    "crypto fitness app",
    "earn crypto workout",
    "crypto rewards fitness",
    "web3 fitness community",
    "decentralized fitness app",
  ],
  path: "/crypto-fitness-app",
});

export default function CryptoFitnessAppPage() {
  return (
    <SeoLandingPage
      eyebrow="Crypto fitness app"
      title="A workout app with a real reward layer"
      description="FitTribe combines the structure of a workout tracker with a wallet-based reward model, making it relevant for people searching for a crypto fitness app rather than a standard gamified points system."
      sections={[
        {
          title: "Why a crypto fitness app is different",
          body: [
            "Most fitness apps use internal points or badges that live only inside the product. FitTribe adds a wallet and on-chain reward layer so consistency can connect to assets and verifiable history outside a single UI.",
            "That changes the way rewards feel. The goal is still the workout habit first, but the incentive model is more durable than ordinary app-only points.",
          ],
        },
        {
          title: "Fitness first, web3 second",
          body: [
            "FitTribe is still meant to feel approachable. Users can track workouts, build a streak, and join the community without needing to understand every technical detail of web3 from day one.",
            "The crypto layer supports the habit loop instead of replacing it. That makes the app useful for both crypto-native users and people who mainly care about consistency.",
          ],
        },
        {
          title: "How the product connects the pieces",
          body: [
            "Workout tracking, an in-app wallet flow, a coach marketplace, and community accountability all sit in one place. The result is a product that can be understood as a crypto fitness app, but still works as a practical daily tracker.",
          ],
        },
      ]}
      links={[
        {
          href: "/blockchain-fitness-rewards",
          title: "Blockchain rewards overview",
          description: "Understand how the reward model works on-chain.",
        },
        {
          href: "/nft-fitness-badges",
          title: "NFT fitness badges",
          description: "See how milestone achievements become wallet-linked proof.",
        },
        {
          href: "/fitness-habit-tracker",
          title: "Habit tracker fundamentals",
          description: "Start with the behavioral side of the product first.",
        },
      ]}
    />
  );
}
