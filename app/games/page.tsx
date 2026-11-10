"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// No lucide-react icons.
import { EmptyState } from "@/components/EmptyState";

// ---------- Reaction Time Game ----------
function ReactionGame() {
  const [state, setState] = useState<"idle" | "waiting" | "ready" | "result" | "tooSoon">("idle");
  const [resultMs, setResultMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    setState("waiting");
    setResultMs(null);
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setState("ready");
    }, delay);
  }

  function click() {
    if (state === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState("tooSoon");
      return;
    }
    if (state === "ready") {
      const ms = Math.round(performance.now() - startRef.current);
      setResultMs(ms);
      setBest((b) => (b === null || ms < b ? ms : b));
      setState("result");
    }
  }

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState("idle");
    setResultMs(null);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <h2 className="text-sm font-semibold tracking-tight text-ink">
        Reaction Time
      </h2>
      <p className="mt-0.5 text-xs text-muted">
        Wait for green, then click as fast as you can. Don&apos;t click early.
      </p>

      <button
        type="button"
        onClick={state === "idle" || state === "result" || state === "tooSoon" ? start : click}
        className={`mt-3 flex h-28 w-full items-center justify-center rounded-md text-sm font-medium ${
          state === "ready"
            ? "bg-[#6b8e6b] text-white"
            : state === "waiting"
              ? "bg-[#b86b6b] text-white"
              : state === "tooSoon"
                ? "bg-[#b86b6b] text-white"
                : "bg-inset text-ink "
        }`}
      >
        {state === "idle" && "Click to start"}
        {state === "waiting" && "Wait for green…"}
        {state === "ready" && "CLICK NOW!"}
        {state === "result" && `${resultMs} ms - click to retry`}
        {state === "tooSoon" && "Too soon! Click to retry"}
      </button>

      {state === "ready" && (
        <button type="button" onClick={click} className="sr-only">
          click
        </button>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-faint">
        <span>Last: {resultMs !== null ? `${resultMs} ms` : "-"}</span>
        <span>Best: {best !== null ? `${best} ms` : "-"}</span>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 text-muted "
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ---------- Meme Memory Game ----------
const EMOJIS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function MemoryGame() {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [first, setFirst] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  function newGame() {
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFirst(null);
    setMoves(0);
    setWon(false);
  }

  useEffect(() => {
    newGame();
  }, []);

  function flip(idx: number) {
    if (won) return;
    const card = cards[idx];
    if (card.flipped || card.matched) return;
    const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    setCards(next);

    if (first === null) {
      setFirst(idx);
    } else {
      setMoves((m) => m + 1);
      const a = next[first];
      const b = next[idx];
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) => (i === first || i === idx ? { ...c, matched: true } : c)));
          setFirst(null);
          // check win
          setCards((prev) => {
            if (prev.every((c) => c.matched)) setWon(true);
            return prev;
          });
        }, 300);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) => (i === first || i === idx ? { ...c, flipped: false } : c)));
          setFirst(null);
        }, 800);
      }
    }
  }

  const matchedCount = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
        Meme Memory
      </h2>
      <p className="mt-0.5 text-xs text-muted">
        Flip cards to find matching emoji pairs. Fewer moves = better.
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            type="button"
            onClick={() => flip(idx)}
            className={`flex h-14 items-center justify-center rounded-md border text-2xl ${
              card.matched
                ? "border-[#6b8e6b] bg-[#eaf2ea] text-ink"
                : card.flipped
                  ? "border-line-strong bg-inset-strong text-ink"
                  : "border-line bg-inset text-transparent "
            }`}
            aria-label={card.flipped || card.matched ? card.emoji : "hidden card"}
          >
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-faint">
        <span>Moves: {moves}</span>
        <span>Pairs: {matchedCount}/{EMOJIS.length}</span>
        <button
          type="button"
          onClick={newGame}
          className="flex items-center gap-1 text-muted "
        >
          New game
        </button>
      </div>

      {won && (
        <p className="mt-2 text-xs font-medium text-ink">
          You won in {moves} moves!
        </p>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Mini Games</h1>
        <p className="mt-0.5 text-sm text-muted">
          Quick distractions for the collective. No stakes, just reflexes.
        </p>
      </div>

      <div className="space-y-4">
        <ReactionGame />
        <MemoryGame />
      </div>

      <div className="mt-6">
        <EmptyState
          title="More games coming"
          description="Got an idea for a meme-themed mini game? Apply to upload and pitch it."
          actionLabel="Apply to upload"
          actionHref="/apply"
        />
      </div>
    </div>
  );
}
