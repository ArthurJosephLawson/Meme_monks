"use client";

import { useState } from "react";
import { Zap, Flame, Share2, Check } from "lucide-react";
import type { Meme } from "@/lib/types";
import { creatorByHandle } from "@/lib/data";
import { timeAgo, formatCount } from "@/lib/format";
import { TagPill } from "./TagPill";

export function MemeCard({ meme }: { meme: Meme }) {
  const [votes, setVotes] = useState<{ based: boolean; laugh: boolean }>({
    based: false,
    laugh: false,
  });
  const [copied, setCopied] = useState(false);

  const creator = creatorByHandle(meme.creator);

  function react(kind: "based" | "laugh") {
    setVotes((v) => {
      if (kind === "based") return { based: !v.based, laugh: false };
      return { based: false, laugh: !v.laugh };
    });
  }

  async function share() {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/?meme=${meme.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const basedCount = meme.based + (votes.based ? 1 : 0);
  const laughCount = meme.laugh + (votes.laugh ? 1 : 0);

  return (
    <article className="overflow-hidden rounded-md border border-line bg-surface">
      <div className="flex items-center gap-2.5 px-3 pb-2 pt-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-inset-strong text-xs font-semibold text-ink">
          {(creator?.monkName ?? meme.creator).charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {creator?.monkName ?? meme.creator}
          </p>
          <p className="truncate text-xs text-faint">@{meme.creator}</p>
        </div>
        <span className="shrink-0 text-xs text-faint">{timeAgo(meme.createdAt)}</span>
      </div>

      <div className="border-y border-line bg-inset">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meme.image}
          alt={meme.title}
          loading="lazy"
          className="block w-full"
        />
      </div>

      <div className="space-y-2 px-3 py-2.5">
        <h3 className="text-sm text-ink">{meme.title}</h3>

        <div className="flex flex-wrap gap-1">
          {meme.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <div className="flex items-center gap-1 border-t border-inset pt-2">
          <button
            onClick={() => react("based")}
            aria-pressed={votes.based}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
              votes.based
                ? "bg-inset-strong font-medium text-ink"
                : "text-muted hover:bg-inset hover:text-ink"
            }`}
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={2} />
            Based
            <span className="tabular-nums text-faint">{formatCount(basedCount)}</span>
          </button>

          <button
            onClick={() => react("laugh")}
            aria-pressed={votes.laugh}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
              votes.laugh
                ? "bg-inset-strong font-medium text-ink"
                : "text-muted hover:bg-inset hover:text-ink"
            }`}
          >
            <Flame className="h-3.5 w-3.5" strokeWidth={2} />
            Laugh
            <span className="tabular-nums text-faint">{formatCount(laughCount)}</span>
          </button>

          <button
            onClick={share}
            aria-label="Share meme"
            className={`ml-auto flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
              copied ? "font-medium text-ink" : "text-muted hover:bg-inset hover:text-ink"
            }`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>
    </article>
  );
}
