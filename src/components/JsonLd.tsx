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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fittribe.co.ke";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FitTribe",
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
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
  name: "FitTribe",
  url: siteUrl,
  description: "Fitness habit tracking and personal trainer marketplace in Nairobi, Kenya",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/trainers?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "FitTribe — Nairobi Fitness Hub",
  url: siteUrl,
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
