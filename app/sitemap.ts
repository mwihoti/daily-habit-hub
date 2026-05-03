import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/trainers"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/community"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/leaderboard"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/goals"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/fitness-habit-tracker"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/crypto-fitness-app"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/blockchain-fitness-rewards"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/nft-fitness-badges"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about-fittribe"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/register"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Dynamic trainer profile routes
  let trainerRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: trainers } = await supabase
      .from("trainer_profiles")
      .select("id, updated_at")
      .eq("is_active", true);

    if (trainers) {
      trainerRoutes = trainers.map((trainer) => ({
        url: absoluteUrl(`/trainers/${trainer.id}`),
        lastModified: trainer.updated_at ? new Date(trainer.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Supabase unavailable at build time — skip dynamic routes
  }

  return [...staticRoutes, ...trainerRoutes];
}
