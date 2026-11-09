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
    <article className="overflow-hidden border border-edge bg-panel transition-colors hover:border-neon/40">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-neon/50 bg-neon/10 font-mono text-xs font-bold text-neon">
          {(creator?.monkName ?? meme.creator).charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm text-zinc-100">
            @{meme.creator}
          </p>
          <p className="truncate font-mono text-[10px] tracking-[0.18em] text-dim">
            {creator?.monkName?.toUpperCase() ?? "ANON MONK"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] tracking-widest text-dim/70">
          {timeAgo(meme.createdAt)}
        </span>
      </div>

      {/* Image */}
      <div className="scanlines border-y border-edge bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meme.image}
          alt={meme.title}
          loading="lazy"
          className="block w-full"
        />
      </div>

      {/* Body */}
      <div className="space-y-3 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-100">{meme.title}</h3>

        <div className="flex flex-wrap gap-1.5">
          {meme.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-edge pt-3">
          <button
            onClick={() => react("based")}
            aria-pressed={votes.based}
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-xs transition-colors ${
              votes.based
                ? "border-neon bg-neon/15 text-neon box-glow"
                : "border-edge text-dim hover:border-neon/50 hover:text-neon"
            }`}
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={2.2} />
            Based
            <span className="tabular-nums opacity-80">{formatCount(basedCount)}</span>
          </button>

          <button
            onClick={() => react("laugh")}
            aria-pressed={votes.laugh}
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-xs transition-colors ${
              votes.laugh
                ? "border-neon bg-neon/15 text-neon box-glow"
                : "border-edge text-dim hover:border-neon/50 hover:text-neon"
            }`}
          >
            <Flame className="h-3.5 w-3.5" strokeWidth={2.2} />
            Laugh
            <span className="tabular-nums opacity-80">{formatCount(laughCount)}</span>
          </button>

          <button
            onClick={share}
            aria-label="Share meme"
            className={`ml-auto flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-xs transition-colors ${
              copied
                ? "border-neon text-neon"
                : "border-edge text-dim hover:border-neon/50 hover:text-neon"
            }`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
            ) : (
              <Share2 className="h-3.5 w-3.5" strokeWidth={2.2} />
            )}
            {copied ? "COPIED" : "Share"}
          </button>
        </div>
      </div>
    </article>
  );
}
