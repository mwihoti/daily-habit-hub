import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { FEATURE_TRAINERS } from "@/lib/featureFlags";

interface JsonLdProps {
  schema: Record<string, unknown>;
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512x512.png`,
  description:
    "FitTribe is a streak accountability app for any goal. Check in once a day, keep your streak, and stay consistent with a community that notices. Built in Nairobi, used anywhere.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  sameAs: [
    "https://twitter.com/FitTribeKE",
    "https://instagram.com/FitTribeKE",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "FitTribe Club",
  url: SITE_URL,
  description:
    "Streak accountability app: daily check-ins, streaks, a community feed and a leaderboard for any goal.",
  // The only on-site search is the trainer directory, which is feature-flagged.
  ...(FEATURE_TRAINERS
    ? {
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/trainers?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }
    : {}),
};

// Local listing for the Nairobi trainer marketplace. Rendered only while the
// trainers feature is on (see app/layout.tsx).
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HealthClub",
  name: "FitTribe Nairobi",
  url: SITE_URL,
  description:
    "Online fitness platform and personal trainer marketplace serving Nairobi — Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu, Allsops and surrounding areas.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressRegion: "Nairobi County",
    addressCountry: "KE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -1.286389,
    longitude: 36.817223,
  },
  areaServed: [
    "Kilimani", "Karen", "Ngong Road", "CBD", "Nairobi CBD",
    "Thika Road", "Roysambu", "Allsops", "Westlands",
    "Lavington", "Gigiri", "Runda", "Muthaiga", "Parklands",
    "South B", "South C", "Langata", "Embakasi",
  ],
  priceRange: "KES",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web, Android",
  browserRequirements: "Requires a modern web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "One-tap daily check-in",
    "Streak tracking and milestone badges",
    "Community feed and leaderboard",
    "Goals and tasks with reminders",
    "Push notifications",
  ],
  description:
    "Free streak accountability app for fitness, study, work or any daily habit. Check in daily, keep your streak, and stay consistent with a community.",
};
