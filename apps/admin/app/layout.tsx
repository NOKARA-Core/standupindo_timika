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
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
