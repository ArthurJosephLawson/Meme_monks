"use client";

import type { FeedTabId } from "@/lib/types";

export type FeedTab = FeedTabId;

const TABS: { id: FeedTab; label: string }[] = [
  { id: "foryou", label: "For You" },
  { id: "new", label: "Newest Memes" },
];

export function FeedTabs({
  tab,
  onChange,
}: {
  tab: FeedTab;
  onChange: (t: FeedTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Feed selection"
      className="flex w-full border border-edge bg-panel p-1"
    >
      {TABS.map(({ id, label }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`flex-1 border px-4 py-2.5 font-mono text-sm tracking-wide transition-colors ${
              active
                ? "border-neon bg-neon font-bold text-ink box-glow"
                : "border-transparent text-dim hover:border-edge hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
