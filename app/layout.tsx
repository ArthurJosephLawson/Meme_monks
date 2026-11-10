import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { MobileBar, Sidebar } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Meme Monks - Curated memes from the collective",
  description:
    "An exclusive, community-driven meme platform. Curated internet humor from creators in good standing.",
};

/**
 * Runs before first paint: applies the persisted theme, falling back
 * to the OS preference. Nonce comes from middleware CSP. Flashes of
 * the wrong theme are avoided because the script is synchronous.
 */
function themeInit(nonce: string) {
  return {
    nonce,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script {...themeInit(nonce ?? "")} />
      </head>
      <body className="min-h-screen bg-base text-ink antialiased" suppressHydrationWarning>
        <Sidebar />
        <MobileBar />
        <main className="min-h-screen pt-12 md:pl-56 md:pt-0">{children}</main>
        <div className="md:pl-56"><Footer /></div>
      </body>
    </html>
  );
}
