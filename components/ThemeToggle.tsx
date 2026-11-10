"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Toggles the `dark` class on <html> and persists the choice.
 * Icons are switched purely via the `dark:` variant, so server and
 * client render identically — no hydration mismatch, no icon flash.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private mode / storage disabled — theme still applies for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      className={`flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-inset hover:text-ink ${className}`}
    >
      <Sun className="h-4 w-4 dark:hidden" strokeWidth={2} />
      <Moon className="hidden h-4 w-4 dark:block" strokeWidth={2} />
    </button>
  );
}
