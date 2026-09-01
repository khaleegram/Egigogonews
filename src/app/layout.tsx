import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { PwaRegister } from "@/components/site/pwa-register";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://egigogonewspaper.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Egigogo Newspaper",
  title: {
    default: "Egigogo Newspaper",
    template: "%s · Egigogo Newspaper",
  },
  description:
    "Truth. Integrity. Impact. — Niger State, Northern Nigeria, and national affairs.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Egigogo Newspaper",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Egigogo Newspaper",
    title: "Egigogo Newspaper",
    description:
      "Truth. Integrity. Impact. — Niger State, Northern Nigeria, and national affairs.",
    url: siteUrl,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Egigogo Newspaper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Egigogo Newspaper",
    description:
      "Truth. Integrity. Impact. — Niger State, Northern Nigeria, and national affairs.",
    images: ["/icons/icon-512.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b5c45" },
    { media: "(prefers-color-scheme: dark)", color: "#1b5c45" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
