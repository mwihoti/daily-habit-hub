import type { Metadata } from "next";

export const SITE_NAME = "FitTribe";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://daily-habit-hub.vercel.app";
export const DEFAULT_OG_IMAGE = "/og-image.png";

type PublicMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  openGraphTitle?: string;
  openGraphDescription?: string;
  type?: "website" | "article" | "profile";
};

export function absoluteUrl(path = ""): string {
  return path ? `${SITE_URL}${path}` : SITE_URL;
}

export function buildPublicMetadata({
  title,
  description,
  path = "",
  keywords = [],
  openGraphTitle,
  openGraphDescription,
  type = "website",
}: PublicMetadataInput): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      locale: "en_KE",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      images: [DEFAULT_OG_IMAGE],
      creator: "@FitTribeKE",
    },
  };
}
