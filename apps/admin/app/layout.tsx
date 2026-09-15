import type { Metadata } from "next";
import { AdminShell } from "../src/components/AdminShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "StandUp INDO Timika - Admin Portal",
  description: "Internal portal for events management, comedians roster, and open mic administration.",
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
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
