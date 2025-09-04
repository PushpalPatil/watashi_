import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { CSPostHogProvider } from "@/components/posthog-provider";
import PostHogPageView from "@/components/posthog-pageview";
import { Suspense } from "react";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Watashi - Meet Your Planetary Companions",
  description: "Connecting you with cosmic wisdom through personalized astrological insights and planetary companions. Explore your birth chart, chat with celestial entities, and discover your cosmic connections.",
  keywords: "astrology, planets, birth chart, cosmic wisdom, zodiac, celestial, horoscope, planetary companions, astrology app",
  authors: [{ name: "Watashi Team" }],
  creator: "Watashi",
  publisher: "Watashi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.watashi.world'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Watashi - Meet Your Planetary Companions',
    description: 'Connecting you with cosmic wisdom through personalized astrological insights and planetary companions. Explore your birth chart, chat with celestial entities, and discover your cosmic connections.',
    siteName: 'Watashi',
    images: [
      {
        url: '/Preview-twitter.png',
        width: 1200,
        height: 630,
        alt: 'Watashi - Cosmic wisdom and planetary companions in a beautiful space-themed interface',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@watashi_app',
    creator: '@watashi_app',
    title: 'Watashi - Meet Your Planetary Companions',
    description: 'Connecting you with cosmic wisdom through personalized astrological insights and planetary companions.',
    images: ['/Preview-twitter.png'],
  },
  icons: {
    icon: [
      { url: '/SUN_ICON2.png', sizes: '32x32', type: 'image/png' },
      { url: '/SUN_ICON2.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/SUN_ICON2.png',
    apple: [
      { url: '/SUN_ICON2.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Watashi",
  "description": "Connecting you with cosmic wisdom through personalized astrological insights and planetary companions. Explore your birth chart, chat with celestial entities, and discover your cosmic connections.",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.watashi.world",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "Watashi Team"
  },
  "keywords": "astrology, planets, birth chart, cosmic wisdom, zodiac, celestial, horoscope, planetary companions",
  "image": "/Preview-twitter.png",
  "screenshot": "/Preview-twitter.png",
  "softwareVersion": "1.0.0",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <CSPostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <Suspense>
              <PostHogPageView />
            </Suspense>
            {children}
          </ThemeProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
