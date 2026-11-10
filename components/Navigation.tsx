"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Trophy, Gamepad2, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/leaderboard", label: "Top Monks", icon: Trophy },
  { href: "/games", label: "Games", icon: Gamepad2 },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-line bg-surface md:flex">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Meme Monks logo"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-md border border-line"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-ink">
              Meme Monks
            </span>
            <span className="block truncate text-[11px] text-faint">
              Creator collective
            </span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-inset-strong font-medium text-ink"
                  : "text-muted hover:bg-inset hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-2">
        <Link
          href="/apply"
          className="flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Apply to upload
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </aside>
  );
}

export function MobileBar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-2 border-b border-line bg-surface px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Meme Monks logo"
          width={28}
          height={28}
          className="h-7 w-7 rounded-md border border-line"
        />
        <span className="text-sm font-semibold tracking-tight text-ink">
          Meme Monks
        </span>
      </Link>

      <nav className="ml-auto flex items-center gap-1">
        <ThemeToggle className="mr-0.5" />
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                active
                  ? "bg-inset-strong text-ink"
                  : "text-muted hover:bg-inset hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </Link>
          );
        })}
        <Link
          href="/apply"
          className="ml-1 flex h-8 items-center rounded-md bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Apply
        </Link>
      </nav>
    </header>
  );
}
