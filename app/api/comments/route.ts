import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { Comment } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");

function json(status: number, body: Record<string, unknown>, extraHeaders?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

async function readComments(): Promise<Comment[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(COMMENTS_FILE, "utf8"));
    if (Array.isArray(parsed)) return parsed as Comment[];
  } catch {
    // No comments yet.
  }
  return [];
}

async function writeComments(list: Comment[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  const tmp = COMMENTS_FILE + "." + randomUUID() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, COMMENTS_FILE);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const memeId = sanitizeText(url.searchParams.get("memeId"), 80);
  if (!memeId) {
    return json(400, { ok: false, error: "memeId is required." });
  }
  const all = await readComments();
  const comments = all.filter((c) => c.memeId === memeId);
  return json(200, { ok: true, comments });
}

export async function POST(req: Request) {
  const key = clientKey(req);
  const limit = rateLimit(`comments:${key}`, { max: 20, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return json(429, { ok: false, error: "Too many comments. Try again later." }, {
      "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  let body: { memeId?: unknown; author?: unknown; text?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > 4000) return json(413, { ok: false, error: "Payload too large." });
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return json(400, { ok: false, error: "Malformed JSON." });
    body = parsed as typeof body;
  } catch {
    return json(400, { ok: false, error: "Malformed JSON." });
  }

  const memeId = sanitizeText(body.memeId, 80);
  const author = sanitizeText(body.author, 40);
  const text = sanitizeText(body.text, 500);

  if (!memeId) return json(422, { ok: false, error: "memeId is required." });
  if (author.length < 2) return json(422, { ok: false, error: "Author must be at least 2 characters." });
  if (text.length < 2) return json(422, { ok: false, error: "Comment must be at least 2 characters." });

  const comment: Comment = {
    id: randomUUID(),
    memeId,
    author,
    text,
    createdAt: new Date().toISOString(),
  };

  const all = await readComments();
  all.push(comment);
  try {
    await writeComments(all);
  } catch {
    return json(500, { ok: false, error: "Could not file comment." });
  }

  return json(201, { ok: true, comment });
}