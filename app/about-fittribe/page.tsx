import type { Metadata } from "next";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildPublicMetadata } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = buildPublicMetadata({
  title: "About FitTribe | Fitness Habit Tracking, Coaches, and Web3 Rewards",
  description:
    "Learn what FitTribe is, how the platform combines workout habit tracking with coaches and blockchain rewards, and why it is built around consistency first.",
  keywords: [
    "about FitTribe",
    "fitness habit tracker company",
    "web3 fitness community",
    "crypto fitness app explained",
    "blockchain fitness rewards platform",
  ],
  path: "/about-fittribe",
});

const principles = [
  {
    title: "Consistency before complexity",
    body:
      "FitTribe is designed around a simple question: can you show up today? The product starts with check-ins, streaks, and habit-building before asking users to care about any advanced feature.",
  },
  {
    title: "Coaching and community in the same product",
    body:
      "The platform is not only a tracker. It also gives members a community feed, rankings, and a coach marketplace so accountability can come from both peers and professionals.",
  },
  {
    title: "Rewards that are meant to reinforce behavior",
    body:
      "FitTribe uses Avalanche-based rewards and milestone badges to make progress more visible. The reward layer exists to support consistency, not distract from it.",
  },
];

export default function AboutFitTribePage() {
  return (
    <Layout>
      <div className="container py-10 md:py-16">
        <div className="max-w-4xl mx-auto space-y-6 mb-12">
          <div className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            About FitTribe
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              A fitness habit tracker built around consistency, accountability, and proof of progress
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              FitTribe combines daily workout tracking, coach discovery, community accountability,
              and wallet-based rewards into one product. The aim is not to overwhelm people with
              features. It is to make regular training easier to sustain.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6">
          {principles.map((principle) => (
            <Card key={principle.title}>
              <CardContent className="p-6 space-y-3">
                <h2 className="text-2xl font-bold">{principle.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{principle.body}</p>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">What the public pages are for</h2>
              <p className="text-muted-foreground">
                FitTribe now has a set of public pages that explain the main parts of the product:
                habit tracking, crypto fitness, blockchain fitness rewards, NFT fitness badges,
                the coach marketplace, and the community. These pages exist to make the platform
                easier to understand before someone signs in.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <Link href="/fitness-habit-tracker" className="text-primary hover:underline">
                  Fitness habit tracker
                </Link>
                <Link href="/crypto-fitness-app" className="text-primary hover:underline">
                  Crypto fitness app
                </Link>
                <Link href="/blockchain-fitness-rewards" className="text-primary hover:underline">
                  Blockchain fitness rewards
                </Link>
                <Link href="/nft-fitness-badges" className="text-primary hover:underline">
                  NFT fitness badges
                </Link>
                <Link href="/trainers" className="text-primary hover:underline">
                  Trainer marketplace
                </Link>
                <Link href="/community" className="text-primary hover:underline">
                  Community feed
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold">Explore coaches</h3>
              <p className="text-sm text-muted-foreground">
                Browse public trainer profiles with specialties, availability, and pricing.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/trainers">
                  Browse trainers <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold">See the leaderboard</h3>
              <p className="text-sm text-muted-foreground">
                View how public streak rankings support motivation and accountability.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/leaderboard">
                  Open leaderboard <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold">Get started</h3>
              <p className="text-sm text-muted-foreground">
                Create an account and move from reading to building a real workout routine.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/register">
                  Create account <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
