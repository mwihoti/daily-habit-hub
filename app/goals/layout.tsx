import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Fitness Goal Tracker Nairobi | Set & Achieve Workout Goals",
  description:
    "Set, track and crush your fitness goals. Used by members across Nairobi — Kilimani, Karen, CBD, Thika Road, Roysambu and Allsops.",
  keywords: [
    "fitness goals Nairobi",
    "workout goal tracker Kenya",
    "fitness challenge Nairobi",
    "weight loss goals Kilimani",
    "fitness tracker Nairobi",
  ],
  path: "/goals",
});

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
