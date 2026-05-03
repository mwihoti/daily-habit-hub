import { SITE_NAME, SITE_URL } from "@/lib/seo";

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
  logo: `${SITE_URL}/favicon.ico`,
  description:
    "Nairobi's fitness habit tracking platform connecting members with verified personal trainers across Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu and Allsops.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  areaServed: [
    { "@type": "City", name: "Nairobi" },
    { "@type": "Neighborhood", name: "Kilimani" },
    { "@type": "Neighborhood", name: "Karen" },
    { "@type": "Neighborhood", name: "Ngong Road" },
    { "@type": "Neighborhood", name: "Nairobi CBD" },
    { "@type": "Neighborhood", name: "Thika Road" },
    { "@type": "Neighborhood", name: "Roysambu" },
    { "@type": "Neighborhood", name: "Allsops" },
    { "@type": "Neighborhood", name: "Westlands" },
    { "@type": "Neighborhood", name: "Lavington" },
  ],
  sameAs: [
    "https://twitter.com/FitTribeKE",
    "https://instagram.com/FitTribeKE",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "FitTribe Nairobi",
  url: SITE_URL,
  description: "Fitness habit tracking and personal trainer marketplace in Nairobi, Kenya",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/trainers?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

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
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KES",
  },
  areaServed: {
    "@type": "City",
    name: "Nairobi",
  },
  description:
    "Fitness habit tracker, trainer marketplace, and workout accountability app for Nairobi members and coaches.",
};
