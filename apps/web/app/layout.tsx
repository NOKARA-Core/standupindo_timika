import type { Metadata } from "next";
import { FloatingSocials } from "../src/components/FloatingSocials";
import SmoothScrollProvider from "../src/components/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StandUpINDO Timika - Laugh Louder. Live Raw.",
  description:
    "Standupindo Timika is where the underground meets the punchline. Unfiltered comedy straight from the rough edges of reality.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://standupindotimika.com"
  ),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/logo-stup_timika.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "StandUpINDO Timika - Laugh Louder. Live Raw.",
    description:
      "Standupindo Timika is where the underground meets the punchline. Unfiltered comedy straight from the rough edges of reality.",
    url: "/",
    siteName: "StandUpINDO Timika",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StandUpINDO Timika Logo",
      },
      {
        url: "/logo-stup_timika.png",
        width: 2000,
        height: 2000,
        alt: "StandUpINDO Timika Official Emblem",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StandUpINDO Timika - Laugh Louder. Live Raw.",
    description:
      "Standupindo Timika is where the underground meets the punchline. Unfiltered comedy straight from the rough edges of reality.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#FDFBF7] text-[#281812] selection:bg-[#FF4500] selection:text-white relative">
        <SmoothScrollProvider>
          {children}
          <FloatingSocials />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
