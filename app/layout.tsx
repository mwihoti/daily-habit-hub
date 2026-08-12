import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  webApplicationSchema,
} from "@/components/JsonLd";
import { PWAManager } from "./components/PWAManager";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

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

// Viewport export is required for themeColor in Next.js 14+
export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FitTribe | Streak Accountability for Any Goal",
    template: "%s | FitTribe",
  },
  description:
    "FitTribe keeps you consistent on any goal — fitness, study, or building a business. Daily check-ins, streaks, a tribe that notices, and on-chain proof.",
  keywords: [
    "habit tracker",
    "streak app",
    "accountability app",
    "daily habit app",
    "goal tracker",
    "consistency app",
    "habit streaks",
    "streak accountability",
    "crypto habit tracker",
    "web3 habit app",
    "on-chain achievements",
    "workout accountability app",
    "study streak tracker",
    "FitTribe",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Health & Fitness",
  openGraph: {
    title: "FitTribe | Streak Accountability for Any Goal",
    description:
      "Chase your goal, keep your streak, and prove you showed up — with a tribe that notices and rewards recorded on-chain.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "FitTribe — streak accountability for any goal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitTribe | Streak Accountability for Any Goal",
    description:
      "Chase your goal, keep your streak, and prove you showed up — daily check-ins with a tribe that notices.",
    images: [DEFAULT_OG_IMAGE],
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
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTribe",
    startupImage: "/icons/icon-512x512.png",
  },
  appLinks: {
    web: {
      url: SITE_URL,
    },
  },
  formatDetection: { telephone: false },
  icons: {
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
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
        <JsonLd schema={webApplicationSchema} />
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </Providers>
        <PWAManager />
      </body>
    </html>
  );
}
