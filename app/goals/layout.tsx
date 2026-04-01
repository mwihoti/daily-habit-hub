import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-habit-hub.vercel.app";

export const metadata: Metadata = {
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
  alternates: { canonical: `${siteUrl}/goals` },
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
