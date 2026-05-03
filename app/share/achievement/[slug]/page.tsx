import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Share2, Trophy } from "lucide-react";
import { absoluteUrl } from "@/lib/seo";
import { getPublicAchievementShareBySlug } from "@/lib/achievementShares";
import { ACHIEVEMENT_NFT_ADDRESS } from "@/lib/web3/habitRegistry";

const SNOWSCAN = "https://snowscan.xyz";

interface Props {
  params: Promise<{ slug: string }>;
}

function displayName(fullName: string | null, username: string | null) {
  return fullName || username || "FitTribe member";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const share = await getPublicAchievementShareBySlug(slug);

  if (!share || !share.meta) {
    return {
      title: "Shared Achievement | FitTribe",
      robots: { index: false, follow: false },
    };
  }

  const name = displayName(share.fullName, share.username);
  const title = `${name} shared a ${share.meta.title} on FitTribe`;
  const description = `${share.meta.description} View this shared achievement badge on FitTribe.`;
  const pageUrl = absoluteUrl(`/share/achievement/${slug}`);
  const imageUrl = absoluteUrl(`/share/achievement/${slug}/opengraph-image`);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      locale: "en_KE",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@FitTribeKE",
    },
  };
}

export default async function SharedAchievementPage({ params }: Props) {
  const { slug } = await params;
  const share = await getPublicAchievementShareBySlug(slug);

  if (!share || !share.meta) {
    notFound();
  }

  const name = displayName(share.fullName, share.username);
  const claimedAt = share.claimedAt
    ? new Date(share.claimedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const walletShort = share.walletAddress
    ? `${share.walletAddress.slice(0, 6)}...${share.walletAddress.slice(-4)}`
    : null;

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-primary/15 text-primary border-0 rounded-full px-4 py-1">
            Public Achievement Share
          </Badge>
          <h1 className="text-4xl font-extrabold">
            {name} unlocked the {share.meta.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {share.meta.description}
          </p>
        </div>

        <Card className={`border-2 ${share.meta.borderColor} shadow-glow overflow-hidden`}>
          <CardContent className="p-8 space-y-6 text-center">
            <div className={`mx-auto w-24 h-24 rounded-3xl ${share.meta.bg} flex items-center justify-center text-5xl`}>
              <span>{share.meta.emoji}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{share.meta.title}</h2>
              <p className="text-muted-foreground">{share.meta.unlockLabel}</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-left">
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Member</p>
                <p className="font-semibold">{name}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Claimed</p>
                <p className="font-semibold">{claimedAt || "Recorded on FitTribe"}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Wallet</p>
                <p className="font-semibold">{walletShort || "Connected on FitTribe"}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 border p-5 text-left">
              <h3 className="font-semibold mb-2">What this means</h3>
              <p className="text-muted-foreground">
                This shared badge page is a public proof-style snapshot from FitTribe.
                It lets anyone view a specific claimed achievement without requiring a login.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {share.walletAddress && (
                <Button variant="outline" asChild>
                  <a
                    href={`${SNOWSCAN}/token/${ACHIEVEMENT_NFT_ADDRESS}?a=${share.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Snowscan
                  </a>
                </Button>
              )}
              <Button variant="hero" asChild>
                <Link href="/register">
                  <Share2 className="w-4 h-4" />
                  Start on FitTribe
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-semibold">Track your workouts</h3>
              <p className="text-sm text-muted-foreground">
                Build a daily routine with the FitTribe habit tracker and streak system.
              </p>
              <Link href="/fitness-habit-tracker" className="text-sm text-primary hover:underline">
                Learn how it works
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-semibold">See reward mechanics</h3>
              <p className="text-sm text-muted-foreground">
                Understand how blockchain fitness rewards and public proof fit into the product.
              </p>
              <Link href="/blockchain-fitness-rewards" className="text-sm text-primary hover:underline">
                Explore rewards
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-semibold">Browse coaches</h3>
              <p className="text-sm text-muted-foreground">
                Add coaching and accountability support when you want more structure.
              </p>
              <Link href="/trainers" className="text-sm text-primary hover:underline">
                View trainer marketplace
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
