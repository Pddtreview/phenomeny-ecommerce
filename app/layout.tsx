import { Cormorant_Garamond, Inter } from "next/font/google";
import { generateDefaultSeo } from "next-seo/pages";
import seoConfig from "@/next-seo.config";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} antialiased`}
      style={{
        WebkitFontSmoothing: "antialiased",
        textRendering: "optimizeLegibility",
      }}
    >
      <head>{generateDefaultSeo(seoConfig)}</head>
      <body className="min-h-screen bg-[#FDFAF5] font-inter text-[#1A1A1A] antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}

