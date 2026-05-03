import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Messages | FitTribe Nairobi",
  description: "Private coach and community conversations inside FitTribe.",
  alternates: { canonical: absoluteUrl("/messages") },
  robots: { index: false, follow: false },
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
