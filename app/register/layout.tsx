import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Join FitTribe Free | Start Your Streak Today",
  description:
    "Create your free FitTribe account in under a minute. Pick a goal, check in once a day, and keep your streak alive with a community that notices.",
  keywords: [
    "free habit tracker",
    "streak app sign up",
    "accountability app free",
    "daily check-in app",
    "join FitTribe",
  ],
  path: "/register",
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
