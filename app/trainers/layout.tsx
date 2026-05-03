import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { buildPublicMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Personal Trainers in Nairobi | Kilimani, Karen, CBD, Thika Road",
  description:
    "Find verified personal trainers near you in Nairobi. Coaches in Kilimani, Karen, Ngong Road, Nairobi CBD, Thika Road, Roysambu, Allsops & Westlands. Weight loss, strength, yoga, HIIT & more.",
  keywords: [
    "personal trainer Nairobi",
    "personal trainer Kilimani",
    "personal trainer Karen Nairobi",
    "fitness coach Ngong Road",
    "gym trainer Nairobi CBD",
    "personal trainer Thika Road",
    "fitness trainer Roysambu",
    "personal trainer Allsops",
    "certified trainer Westlands",
    "weight loss coach Nairobi",
    "home workout trainer Nairobi",
    "online personal trainer Kenya",
    "strength training coach Nairobi",
    "yoga instructor Nairobi",
    "HIIT trainer Nairobi",
  ],
  path: "/trainers",
  openGraphTitle: "Personal Trainers in Nairobi | FitTribe",
  openGraphDescription:
    "Browse verified personal trainers across Nairobi — Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu and Allsops.",
});

const trainerListingSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Personal Trainers in Nairobi",
  description: "Verified personal trainers in Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu and Allsops",
  url: absoluteUrl("/trainers"),
  areaServed: [
    "Kilimani", "Karen", "Ngong Road", "Nairobi CBD",
    "Thika Road", "Roysambu", "Allsops", "Westlands", "Lavington",
  ],
};

export default function TrainersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={trainerListingSchema} />
      {children}
    </>
  );
}
