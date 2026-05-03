import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Auth Test | FitTribe Nairobi",
  description: "Internal authentication testing page.",
  alternates: { canonical: absoluteUrl("/auth-test") },
  robots: { index: false, follow: false },
};

export default function AuthTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
