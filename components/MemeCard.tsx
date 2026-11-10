"use client";

import { useState } from "react";
import { Zap, Flame, Share2, Check, MessageCircle, Send } from "lucide-react";
import type { Meme, Comment } from "@/lib/types";
import { creatorByHandle } from "@/lib/data";
import { timeAgo, formatCount } from "@/lib/format";
import { TagPill } from "./TagPill";

export function MemeCard({ meme }: { meme: Meme }) {
  const [votes, setVotes] = useState<{ based: boolean; laugh: boolean }>({
    based: false,
    laugh: false,
  });
  const [copied, setCopied] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  async function loadComments() {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?memeId=${encodeURIComponent(meme.id)}`, { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; comments?: Comment[] };
      if (data?.ok) setComments(data.comments ?? []);
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  }

  function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments.length === 0) loadComments();
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !commentAuthor.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memeId: meme.id, author: commentAuthor.trim(), text: commentText.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; comment?: Comment; error?: string };
      if (res.ok && data?.ok && data.comment) {
        setComments((c) => [...c, data.comment as Comment]);
        setCommentText("");
      }
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  }

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

      {meme.commentsEnabled && (
        <div className="border-t border-line px-3 py-2.5">
          <button
            type="button"
            onClick={toggleComments}
            className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {commentsOpen ? "Hide comments" : "Comments"}
            {comments.length > 0 && (
              <span className="tabular-nums text-faint">({comments.length})</span>
            )}
          </button>

          {commentsOpen && (
            <div className="mt-2 space-y-2">
              {loadingComments ? (
                <p className="text-xs text-faint">Loading comments…</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-faint">No comments yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {comments.map((c) => (
                    <li key={c.id} className="rounded-md bg-inset px-2.5 py-1.5">
                      <p className="text-xs font-medium text-ink">
                        {c.author}{" "}
                        <span className="font-normal text-faint">
                          · {timeAgo(c.createdAt)}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={postComment} className="mt-2 flex items-center gap-1.5">
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Name"
                  maxLength={40}
                  className="h-7 w-24 rounded-md border border-line bg-surface px-2 text-xs text-ink placeholder:text-soft outline-none focus:border-line-strong"
                />
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  maxLength={500}
                  className="h-7 flex-1 rounded-md border border-line bg-surface px-2 text-xs text-ink placeholder:text-soft outline-none focus:border-line-strong"
                />
                <button
                  type="submit"
                  disabled={posting || !commentText.trim() || !commentAuthor.trim()}
                  aria-label="Post comment"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
