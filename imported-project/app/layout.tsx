import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { generateDefaultSeo } from "next-seo/pages";
import seoConfig from "@/next-seo.config";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nauvaraha.com"),
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      style={{
        WebkitFontSmoothing: "antialiased",
        textRendering: "optimizeLegibility",
      }}
    >
      <head>{generateDefaultSeo(seoConfig)}</head>
      <body className="min-h-screen bg-[#FFFFFF] font-inter text-[#1A1A1A] antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}

