"use client";

/**
 * Toggles the `dark` class on <html> and persists the choice.
 * Label is switched purely via the `dark:` variant, so server and
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
      className={`flex h-8 items-center justify-center rounded-md px-2 text-xs text-muted ${className}`}
    >
      <span className="dark:hidden">Dark</span>
      <span className="hidden dark:inline">Light</span>
    </button>
  );
}
