"use client";

import { useEffect, useState } from "react";
import type { Meme } from "./types";

/**
 * Client-side loader for published memes. The feed/search/leaderboard read
 * from the /api/memes store (populated by the dev publish CLI) instead of
 * the static (empty) in-memory surface.
 */
export function useMemes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/memes", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { ok?: boolean; memes?: Meme[] }) => {
        if (alive && data?.ok) setMemes(data.memes ?? []);
      })
      .catch(() => {
        // Keep empty state on failure; never crash the page.
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { memes, loading };
}
