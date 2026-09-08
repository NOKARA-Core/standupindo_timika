import type { Metadata } from "next";
import { FloatingSocials } from "../src/components/FloatingSocials";
import "./globals.css";

export const metadata: Metadata = {
  title: "StandUpINDO Timika - Laugh Louder. Live Raw.",
  description: "Standupindo Timika is where the underground meets the punchline. Unfiltered comedy straight from the rough edges of reality.",
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
        {children}
        <FloatingSocials />
      </body>
    </html>
  );
}
