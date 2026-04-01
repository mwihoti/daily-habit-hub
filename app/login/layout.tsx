import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-habit-hub.vercel.app";

export const metadata: Metadata = {
  title: "Sign In | FitTribe Nairobi",
  description: "Sign in to your FitTribe account and continue your fitness journey.",
  alternates: { canonical: `${siteUrl}/login` },
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
