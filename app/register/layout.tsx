import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Join FitTribe | Free Fitness Community in Nairobi",
  description:
    "Create your free FitTribe account and join thousands of fitness enthusiasts across Nairobi — Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu and Allsops.",
  keywords: [
    "join fitness community Nairobi",
    "free fitness app Kenya",
    "register FitTribe Nairobi",
    "workout app Kenya",
  ],
  path: "/register",
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
