"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Trophy, Terminal, ArrowUpRight } from "lucide-react";

const NAV = [
  { href: "/", label: "Home", hint: "FEED", icon: Home },
  { href: "/search", label: "Search", hint: "SCAN", icon: Search },
  { href: "/leaderboard", label: "Top Monks", hint: "RANK", icon: Trophy },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-edge bg-panel/90 backdrop-blur md:flex">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 border-b border-edge px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center border border-neon/60 bg-neon/10 text-neon box-glow">
          <Terminal className="h-4.5 w-4.5" strokeWidth={2.2} />
        </span>
        <span>
          <span className="block font-mono text-sm font-bold tracking-[0.18em] text-zinc-100">
            MEME MONKS
          </span>
          <span className="block font-mono text-[10px] tracking-[0.22em] text-dim">
            EXCLUSIVE MEME ORDER
          </span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV.map(({ href, label, hint, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 border px-3 py-2.5 font-mono text-sm transition-colors ${
                active
                  ? "border-neon/50 bg-neon/10 text-neon box-glow"
                  : "border-transparent text-dim hover:border-edge hover:bg-edge/40 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span className="flex-1">{label}</span>
              <span className="text-[10px] tracking-[0.2em] opacity-50">{hint}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA */}
      <div className="border-t border-edge p-3">
        <Link
          href="/apply"
          className="flex items-center justify-center gap-2 border border-neon bg-neon px-3 py-3 font-mono text-sm font-bold tracking-wide text-ink transition-shadow hover:box-glow"
        >
          APPLY TO UPLOAD
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
        <p className="mt-3 px-1 font-mono text-[10px] leading-relaxed tracking-widest text-dim/70">
          ORDER STATUS: CURATED
          <br />
          UPLINK: STABLE // V0.1.0
        </p>
      </div>
    </aside>
  );
}

export function MobileBar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b border-edge bg-ink/95 px-4 backdrop-blur md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center border border-neon/60 bg-neon/10 text-neon">
          <Terminal className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="font-mono text-xs font-bold tracking-[0.18em] text-zinc-100">
          MEME MONKS
        </span>
      </Link>

      <nav className="ml-auto flex items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                active
                  ? "border-neon/50 bg-neon/10 text-neon"
                  : "border-transparent text-dim hover:text-zinc-200"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </Link>
          );
        })}
        <Link
          href="/apply"
          aria-label="Apply to Upload"
          className="ml-1 flex h-9 items-center border border-neon bg-neon px-3 font-mono text-[11px] font-bold tracking-wide text-ink"
        >
          APPLY
        </Link>
      </nav>
    </header>
  );
}
