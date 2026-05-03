import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Progress | FitTribe Nairobi",
  description: "Private progress insights for FitTribe members.",
  alternates: { canonical: absoluteUrl("/progress") },
  robots: { index: false, follow: false },
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
