import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tasks | FitTribe Nairobi",
  description: "Private tasks and habit planning tools for FitTribe members.",
  alternates: { canonical: absoluteUrl("/tasks") },
  robots: { index: false, follow: false },
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
