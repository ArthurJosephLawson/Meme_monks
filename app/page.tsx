"use client";

import { useMemo, useState } from "react";
import { MEMES } from "@/lib/data";
import { MemeCard } from "@/components/MemeCard";
import { FeedTabs, type FeedTab } from "@/components/FeedTabs";

export default function FeedPage() {
  const [tab, setTab] = useState<FeedTab>("foryou");

  const memes = useMemo(() => {
    const sorted = [...MEMES];
    if (tab === "foryou") {
      sorted.sort((a, b) => b.based + b.laugh - (a.based + a.laugh));
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return sorted;
  }, [tab]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.3em] text-neon text-glow">
          FEED://HOME
        </p>
        <h1 className="mt-1 font-mono text-2xl font-bold tracking-wide text-zinc-100">
          THE FEED
        </h1>
        <p className="mt-1 text-sm text-dim">
          Curated signals from the order. Only monks in good standing transmit.
        </p>
      </header>

      <FeedTabs tab={tab} onChange={setTab} />

      <div className="mt-6 space-y-6">
        {memes.map((meme) => (
          <MemeCard key={meme.id} meme={meme} />
        ))}
      </div>

      <footer className="mt-10 border-t border-edge py-6 text-center font-mono text-[10px] tracking-[0.3em] text-dim/60">
        END OF TRANSMISSION // MEME MONKS
      </footer>
    </div>
  );
}
