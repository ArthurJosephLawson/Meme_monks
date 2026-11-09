"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { MEMES } from "@/lib/data";
import { MemeCard } from "@/components/MemeCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    return MEMES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.creator.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.3em] text-neon text-glow">
          SCAN://ARCHIVE
        </p>
        <h1 className="mt-1 font-mono text-2xl font-bold tracking-wide text-zinc-100">
          SEARCH
        </h1>
        <p className="mt-1 text-sm text-dim">
          Filter memes by title, tag, or creator handle. Press{" "}
          <kbd className="border border-edge px-1.5 py-0.5 font-mono text-[10px] text-neon">
            /
          </kbd>{" "}
          to focus.
        </p>
      </header>

      {/* Instant search bar */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="query the archive… (e.g. docker, @nullmonk, coffee)"
          aria-label="Search memes"
          className="w-full border border-edge bg-panel py-3.5 pl-11 pr-11 font-mono text-sm text-zinc-100 placeholder:text-dim/50 outline-none transition-colors focus:border-neon focus:box-glow"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dim transition-colors hover:text-neon"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] tracking-[0.25em] text-dim">
        {searching
          ? `${results.length} MEME${results.length === 1 ? "" : "S"} FOUND`
          : "TYPE TO SCAN THE ARCHIVE"}
      </p>

      <div className="mt-4 space-y-6">
        {searching ? (
          results.length > 0 ? (
            results.map((meme) => <MemeCard key={meme.id} meme={meme} />)
          ) : (
            <div className="border border-dashed border-edge bg-panel px-6 py-14 text-center">
              <p className="font-mono text-sm text-neon text-glow">NO SIGNALS FOUND</p>
              <p className="mt-2 text-sm text-dim">
                No memes match “{query.trim()}”. Try a tag, title, or @handle.
              </p>
            </div>
          )
        ) : (
          <div className="border border-dashed border-edge bg-panel px-6 py-14 text-center">
            <p className="font-mono text-sm text-dim">
              AWAITING QUERY — the archive holds {MEMES.length} transmissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
