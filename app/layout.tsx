import type { Metadata } from "next";
import { Space_Grotesk, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";
import { JsonLd, organizationSchema, websiteSchema, localBusinessSchema } from "@/components/JsonLd";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-habit-hub.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FitTribe — Fitness & Personal Trainers in Nairobi",
    template: "%s | FitTribe Nairobi",
  },
  description:
    "Nairobi's fitness app. Find personal trainers in Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu & Allsops. Track workouts, earn rewards.",
  keywords: [
    "personal trainer Nairobi",
    "fitness trainer Kilimani",
    "gym Nairobi Karen",
    "personal trainer Ngong Road",
    "fitness coach Nairobi CBD",
    "workout trainer Thika Road",
    "personal trainer Roysambu",
    "fitness coach Allsops",
    "online fitness coach Kenya",
    "certified personal trainer Nairobi",
    "weight loss trainer Nairobi",
    "home workout trainer Nairobi",
    "fitness habit tracker Kenya",
    "FitTribe Nairobi",
    "workout accountability Nairobi",
    "fitness community Nairobi",
  ],
  authors: [{ name: "FitTribe", url: siteUrl }],
  creator: "FitTribe",
  publisher: "FitTribe",
  category: "Health & Fitness",
  openGraph: {
    title: "FitTribe — Fitness & Personal Trainers in Nairobi",
    description:
      "Find verified personal trainers in Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu & Allsops. Track workouts daily and earn rewards.",
    type: "website",
    url: siteUrl,
    siteName: "FitTribe",
    locale: "en_KE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FitTribe — Nairobi Fitness Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitTribe — Fitness & Personal Trainers in Nairobi",
    description:
      "Find verified personal trainers in Kilimani, Karen, Ngong Road, CBD, Thika Road, Roysambu & Allsops.",
    images: ["/og-image.png"],
    creator: "@FitTribeKE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE" className={`${spaceGrotesk.variable} ${nunito.variable}`}>
      <body className="font-body">
        <JsonLd schema={organizationSchema} />
        <JsonLd schema={websiteSchema} />
        <JsonLd schema={localBusinessSchema} />
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
