import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = "https://ekorafon.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ekorafon — Verified Manufacturers & B2B Sourcing in Aba, Nigeria",
    template: "%s | Ekorafon",
  },
  description:
    "Nigeria's B2B sourcing marketplace. Find verified manufacturers in Aba for wholesale shoes, garments, leather goods & more. Post a free RFQ and get direct factory quotes.",
  keywords: [
    "Aba manufacturers",
    "made in Aba",
    "Nigeria B2B marketplace",
    "wholesale suppliers Nigeria",
    "verified manufacturers Nigeria",
    "African sourcing platform",
    "buy wholesale from Aba",
    "Nigerian factories",
    "RFQ Nigeria",
    "made in Nigeria products",
  ],
  applicationName: "Ekorafon",
  authors: [{ name: "Ekorafon" }],
  creator: "Ekorafon Limited",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    siteName: "Ekorafon",
    locale: "en_NG",
    type: "website",
    title: "Ekorafon — Verified Manufacturers & B2B Sourcing in Aba, Nigeria",
    description:
      "Discover verified African factories, post free RFQs, and trade with confidence. Wholesale sourcing from Aba, Nigeria — no middlemen.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ekorafon" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ekorafon — Verified Manufacturers & B2B Sourcing in Aba, Nigeria",
    description:
      "Discover verified African factories, post free RFQs, and trade with confidence. Wholesale sourcing from Aba, Nigeria — no middlemen.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
