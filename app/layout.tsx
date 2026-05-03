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
import { SITE_URL, SITE_NAME } from "@/lib/seo";

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
    default: "FitTribe Nairobi | Personal Trainers, Fitness Community & Workout Tracking",
    template: "%s | FitTribe Nairobi",
  },
  description:
    "Find personal trainers in Nairobi, join a fitness community, and track workouts with FitTribe across Kilimani, Karen, Ngong Road, CBD, Roysambu, and Allsops.",
  keywords: [
    "personal trainer Nairobi",
    "fitness app Nairobi",
    "fitness community Nairobi",
    "workout tracker Kenya",
    "personal trainers Kilimani",
    "personal trainers Karen Nairobi",
    "fitness coach Ngong Road",
    "gym trainer Nairobi CBD",
    "workout coach Thika Road",
    "trainer Roysambu",
    "fitness coach Allsops",
    "online fitness coach Kenya",
    "weight loss coach Nairobi",
    "home workout trainer Nairobi",
    "workout accountability app",
    "FitTribe Nairobi",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Health & Fitness",
  openGraph: {
    title: "FitTribe Nairobi | Personal Trainers, Fitness Community & Workout Tracking",
    description:
      "Find verified personal trainers in Nairobi, track workouts daily, and join a fitness community built for consistency.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_KE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FitTribe Nairobi fitness community and personal trainers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitTribe Nairobi | Personal Trainers & Workout Tracking",
    description:
      "Find personal trainers in Nairobi, join a fitness community, and track daily workouts on FitTribe.",
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
