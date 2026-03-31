import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fittribe.co.ke";

export const metadata: Metadata = {
  title: "Fitness Community Nairobi | Workout Together in Kilimani, Karen & CBD",
  description:
    "Join Nairobi's most active fitness community. Connect with workout partners in Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu and Allsops. Share progress, stay accountable.",
  keywords: [
    "fitness community Nairobi",
    "workout group Nairobi",
    "fitness accountability Kilimani",
    "workout partners Karen Nairobi",
    "fitness challenge Nairobi CBD",
    "gym community Thika Road",
    "workout group Roysambu",
    "fitness tribe Allsops",
    "online fitness community Kenya",
  ],
  alternates: { canonical: `${siteUrl}/community` },
  openGraph: {
    title: "Fitness Community Nairobi | FitTribe",
    description:
      "Join thousands of Nairobi fitness enthusiasts in Kilimani, Karen, CBD, Thika Road, Roysambu & Allsops.",
    url: `${siteUrl}/community`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
