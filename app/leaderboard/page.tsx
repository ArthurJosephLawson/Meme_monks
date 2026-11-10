"use client";

import { useMemo } from "react";
// No lucide-react icons.
import { formatCount } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { useMemes } from "@/lib/use-memes";

interface MonkRow {
  handle: string;
  monkName: string;
  memes: number;
  based: number;
  laugh: number;
}

export default function LeaderboardPage() {
  const { memes, loading } = useMemes();

  const rows = useMemo<MonkRow[]>(() => {
    const byCreator = new Map<string, MonkRow>();
    for (const m of memes) {
      const existing = byCreator.get(m.creator);
      if (existing) {
        existing.memes += 1;
        existing.based += m.based;
        existing.laugh += m.laugh;
      } else {
        byCreator.set(m.creator, {
          handle: m.creator,
          monkName: m.creator,
          memes: 1,
          based: m.based,
          laugh: m.laugh,
        });
      }
    }
    return Array.from(byCreator.values()).sort(
      (a, b) => b.based + b.laugh - (a.based + a.laugh),
    );
  }, [memes]);

  const max = Math.max(1, ...rows.map((r) => r.based + r.laugh));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Top Monks</h1>
        <p className="mt-0.5 text-sm text-muted">
          Creators ranked by total reactions this season.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading rankings">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md border border-line bg-surface px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 rounded bg-inset" />
                <div className="h-4 w-32 rounded bg-inset" />
              </div>
              <div className="mt-2 h-1 rounded-full bg-inset" />
            </div>
          ))}
        </div>
      ) : rows.length > 0 ? (
        <ol className="space-y-2">
          {rows.map((row, i) => {
            const rank = i + 1;
            const total = row.based + row.laugh;
            const width = `${Math.round((total / max) * 100)}%`;
            return (
              <li
                key={row.handle}
                className="rounded-md border border-line bg-surface px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-sm font-semibold tabular-nums text-faint">
                    {rank}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {row.monkName}
                      <span className="ml-1.5 text-xs font-normal text-faint">
                        @{row.handle}
                      </span>
                    </p>
                    <p className="text-xs text-faint">
                      {row.memes} meme{row.memes === 1 ? "" : "s"} published
                    </p>
                  </div>

                  <div className="shrink-0 text-right text-xs text-muted">
                    <p className="flex items-center justify-end gap-1 tabular-nums">
                      {formatCount(row.based)} based
                    </p>
                    <p className="mt-0.5 flex items-center justify-end gap-1 tabular-nums text-faint">
                      {formatCount(row.laugh)} laugh
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-1 rounded-full bg-inset-strong">
                  <div className="h-full rounded-full bg-accent" style={{ width }} />
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState
          title="No ranked creators yet"
          description="Rankings appear once creators publish memes. Apply to upload and claim the first spot."
          actionLabel="Apply to upload"
          actionHref="/apply"
        />
      )}

      {rows.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-faint">
          Ranks refresh as reactions come in.
        </p>
      )}
    </div>
  );
}
