import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ekorafon Admin",
  description: "Ekorafon internal administration panel",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
