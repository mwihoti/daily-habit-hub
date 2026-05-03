import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Profile | FitTribe Nairobi",
  description: "Private member profile and account settings.",
  alternates: { canonical: absoluteUrl("/profile") },
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
