import { Trophy, Zap, Flame } from "lucide-react";
import { CREATORS, MEMES } from "@/lib/data";
import { formatCount } from "@/lib/format";

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
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.3em] text-neon text-glow">
          RANK://KARMA
        </p>
        <h1 className="mt-1 font-mono text-2xl font-bold tracking-wide text-zinc-100">
          TOP MONKS
        </h1>
        <p className="mt-1 text-sm text-dim">
          The order&apos;s highest-transmission creators, ranked by total reactions.
        </p>
      </header>

      <ol className="space-y-3">
        {rows.map((row, i) => {
          const rank = i + 1;
          const total = row.based + row.laugh;
          const width = `${Math.round((total / max) * 100)}%`;
          const top3 = rank <= 3;
          return (
            <li
              key={row.handle}
              className={`border bg-panel p-4 ${
                top3 ? "border-neon/50 box-glow" : "border-edge"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center border font-mono text-sm font-bold ${
                    top3
                      ? "border-neon bg-neon/15 text-neon"
                      : "border-edge bg-edge/40 text-dim"
                  }`}
                >
                  {rank === 1 ? (
                    <Trophy className="h-4.5 w-4.5" strokeWidth={2.2} />
                  ) : (
                    String(rank).padStart(2, "0")
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-zinc-100">
                    @{row.handle}
                    {top3 && (
                      <span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-neon">
                        {"// "}
                        {row.monkName.toUpperCase()}
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-[10px] tracking-widest text-dim">
                    {row.memes} TRANSMISSION{row.memes === 1 ? "" : "S"}
                  </p>
                </div>

                <div className="shrink-0 text-right font-mono text-xs">
                  <p className="flex items-center justify-end gap-1 text-neon">
                    <Zap className="h-3 w-3" /> {formatCount(row.based)}
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-1 text-dim">
                    <Flame className="h-3 w-3" /> {formatCount(row.laugh)}
                  </p>
                </div>
              </div>

              {/* Power bar */}
              <div className="mt-3 h-1.5 w-full bg-edge/50">
                <div className="h-full bg-neon" style={{ width }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
