import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fittribe.co.ke";

export const metadata: Metadata = {
  title: "Join FitTribe | Free Fitness Community in Nairobi",
  description:
    "Create your free FitTribe account and join thousands of fitness enthusiasts across Nairobi — Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu and Allsops.",
  keywords: [
    "join fitness community Nairobi",
    "free fitness app Kenya",
    "register FitTribe Nairobi",
    "workout app Kenya",
  ],
  alternates: { canonical: `${siteUrl}/register` },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
