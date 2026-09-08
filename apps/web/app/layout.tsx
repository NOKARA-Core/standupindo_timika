import type { Metadata } from "next";
import { Anton, Space_Mono, Work_Sans } from "next/font/google";
import { FloatingSocials } from "../src/components/FloatingSocials";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const workSans = Work_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

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
      <body
        className={`${anton.variable} ${spaceMono.variable} ${workSans.variable} font-sans antialiased bg-[#FDFBF7] text-[#281812] selection:bg-[#FF4500] selection:text-white relative`}
      >
        {children}
        <FloatingSocials />
      </body>
    </html>
  );
}
