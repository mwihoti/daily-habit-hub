import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sign In | FitTribe Nairobi",
  description: "Sign in to your FitTribe account and continue your fitness journey.",
  alternates: { canonical: absoluteUrl("/login") },
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
