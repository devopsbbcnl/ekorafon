import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Ekorafon — African Trade Infrastructure",
  description: "Discover manufacturers, source products, and trade with confidence across Aba and beyond.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Ekorafon — African Trade Infrastructure",
    description: "Discover manufacturers, source products, and trade with confidence across Aba and beyond.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ekorafon" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ekorafon — African Trade Infrastructure",
    description: "Discover manufacturers, source products, and trade with confidence across Aba and beyond.",
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
