import type { Metadata } from "next";
import "./globals.css";
import { MobileBar, Sidebar } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Meme Monks — Curated memes from the collective",
  description:
    "An exclusive, community-driven meme platform. Curated internet humor from creators in good standing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base text-ink antialiased">
        <Sidebar />
        <MobileBar />
        <main className="min-h-screen pt-12 md:pl-56 md:pt-0">{children}</main>
      </body>
    </html>
  );
}
