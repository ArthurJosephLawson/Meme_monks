"use client";

import { useMemo, useState } from "react";
import { MemeCard } from "@/components/MemeCard";
import { FeedTabs, type FeedTab } from "@/components/FeedTabs";
import { EmptyState } from "@/components/EmptyState";
import { useMemes } from "@/lib/use-memes";

export default function FeedPage() {
  const [tab, setTab] = useState<FeedTab>("foryou");
  const { memes: source, loading } = useMemes();

  const memes = useMemo(() => {
    const sorted = [...source];
    if (tab === "foryou") {
      sorted.sort((a, b) => b.based + b.laugh - (a.based + a.laugh));
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return sorted;
  }, [source, tab]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Feed</h1>
          <p className="mt-0.5 text-sm text-muted">
            Curated memes from creators in good standing.
          </p>
        </div>
        <FeedTabs tab={tab} onChange={setTab} />
      </div>

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading memes">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-md border border-line bg-surface">
              <div className="flex items-center gap-2.5 px-3 py-3">
                <div className="h-7 w-7 rounded-md bg-inset" />
                <div className="h-3 w-24 rounded bg-inset" />
              </div>
              <div className="h-48 bg-inset" />
              <div className="space-y-2 px-3 py-2.5">
                <div className="h-3 w-3/4 rounded bg-inset" />
                <div className="h-3 w-1/2 rounded bg-inset" />
              </div>
            </div>
          ))}
        </div>
      ) : memes.length > 0 ? (
        <div className="space-y-4">
          {memes.map((meme) => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No memes yet"
          description="The first transmissions land here. Creator applications are open - apply and be first through the gate."
          actionLabel="Apply to upload"
          actionHref="/apply"
        />
      )}
    </div>
  );
}
