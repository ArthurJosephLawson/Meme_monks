"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { MemeCard } from "@/components/MemeCard";
import { EmptyState } from "@/components/EmptyState";
import { useMemes } from "@/lib/use-memes";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { memes: source } = useMemes();

  // "/" focuses the search input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return source.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.creator.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query, source]);

  const searching = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Search</h1>
        <p className="mt-0.5 text-sm text-muted">
          Find memes by title, tag, or creator. Press{" "}
          <kbd className="rounded border border-line bg-inset px-1 py-px text-[11px] text-muted">
            /
          </kbd>{" "}
          to focus.
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the archive…"
          aria-label="Search memes"
          className="h-9 w-full rounded-md border border-line bg-surface pl-8 pr-8 text-sm text-ink placeholder:text-soft outline-none transition-colors focus:border-line-strong"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-faint transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {searching ? (
        <>
          <p className="mt-3 text-xs text-faint">
            {results.length} meme{results.length === 1 ? "" : "s"} found
          </p>
          <div className="mt-3 space-y-4">
            {results.length > 0 ? (
              results.map((meme) => <MemeCard key={meme.id} meme={meme} />)
            ) : (
              <EmptyState
                title="No matches"
                description={`Nothing matches “${query.trim()}”. Try a tag, a title, or a creator handle.`}
              />
            )}
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs text-faint">
          Start typing to filter the archive live.
        </p>
      )}
    </div>
  );
}
