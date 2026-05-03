import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Onboarding | FitTribe Nairobi",
  description: "Private onboarding flow for new FitTribe members.",
  alternates: { canonical: absoluteUrl("/onboarding") },
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
