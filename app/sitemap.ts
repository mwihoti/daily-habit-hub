import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-habit-hub.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/trainers`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic trainer profile routes
  let trainerRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: trainers } = await supabase
      .from("trainer_profiles")
      .select("id, updated_at")
      .eq("is_verified", true);

    if (trainers) {
      trainerRoutes = trainers.map((trainer) => ({
        url: `${siteUrl}/trainers/${trainer.id}`,
        lastModified: trainer.updated_at ? new Date(trainer.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Supabase unavailable at build time — skip dynamic routes
  }

  return [...staticRoutes, ...trainerRoutes];
}
