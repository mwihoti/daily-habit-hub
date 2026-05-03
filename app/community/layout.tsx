import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
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
  path: "/community",
  openGraphTitle: "Fitness Community Nairobi | FitTribe",
  openGraphDescription:
    "Join thousands of Nairobi fitness enthusiasts in Kilimani, Karen, CBD, Thika Road, Roysambu and Allsops.",
});

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
