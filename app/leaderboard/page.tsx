import { Trophy, Zap, Flame } from "lucide-react";
import { CREATORS, MEMES } from "@/lib/data";
import { formatCount } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

interface MonkRow {
  handle: string;
  monkName: string;
  memes: number;
  based: number;
  laugh: number;
}

function computeLeaderboard(): MonkRow[] {
  return CREATORS.map((c) => {
    const posted = MEMES.filter((m) => m.creator === c.handle);
    return {
      handle: c.handle,
      monkName: c.monkName,
      memes: posted.length,
      based: posted.reduce((s, m) => s + m.based, 0),
      laugh: posted.reduce((s, m) => s + m.laugh, 0),
    };
  }).sort((a, b) => b.based + b.laugh - (a.based + a.laugh));
}

export default function LeaderboardPage() {
  const rows = computeLeaderboard();
  const max = Math.max(1, ...rows.map((r) => r.based + r.laugh));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Top Monks</h1>
        <p className="mt-0.5 text-sm text-muted">
          Creators ranked by total reactions this season.
        </p>
      </div>

      {rows.length > 0 ? (
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
                      <Zap className="h-3 w-3 text-soft" /> {formatCount(row.based)}
                    </p>
                    <p className="mt-0.5 flex items-center justify-end gap-1 tabular-nums text-faint">
                      <Flame className="h-3 w-3 text-soft" /> {formatCount(row.laugh)}
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
          <Trophy className="h-3.5 w-3.5 text-soft" />
          Ranks refresh as reactions come in.
        </p>
      )}
    </div>
  );
}
