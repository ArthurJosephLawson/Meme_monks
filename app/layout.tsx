import type { Metadata } from "next";
import "./globals.css";
import { MobileBar, Sidebar } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Meme Monks — Exclusive Curated Memes",
  description:
    "An exclusive, community-driven meme platform. Curated internet humor from the order.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-zinc-200 antialiased">
        <Sidebar />
        <MobileBar />
        <main className="min-h-screen pt-14 md:pl-60 md:pt-0">{children}</main>
      </body>
    </html>
  );
}
