import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { sanitizeText } from "@/lib/sanitize";
import type { Meme } from "@/lib/types";

// Dev-only publish surface backing the terminal CLI tool
// (`npm run publish:meme`). Applications funnel here after the Operations
// Lead approves a submission and hands the final meme over.

const DATA_DIR = path.join(process.cwd(), ".data");
const MEMES_FILE = path.join(DATA_DIR, "memes.json");
const PUBLIC_MEMES_DIR = path.join(process.cwd(), "public", "memes");

// Dev passkey lives in the CLI (`scripts/publish-meme.mjs`) and is mirrored
// here as the default server-side gate. Override with DEV_PUBLISH_KEY.
const DEV_PUBLISH_KEY = process.env.DEV_PUBLISH_KEY ?? "5cr1pt@m0nks";

function isDevAuthorized(req: Request): boolean {
  return req.headers.get("x-dev-key") === DEV_PUBLISH_KEY;
}

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

interface PublishBody {
  creator: unknown;
  title: unknown;
  image: unknown;
  commentsEnabled: unknown;
}

function isValidImage(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 3_500_000) return false;
  // Dev uploads may carry the meme as a base64 data URL (terminal CLI) or
  // as an externally hosted http(s) URL.
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(value)) return true;
  if (/^https?:\/\//i.test(value)) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return false;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  } else {
    return false;
  }
  return true;
}

async function readMemes(): Promise<Meme[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(MEMES_FILE, "utf8"));
    if (Array.isArray(parsed)) return parsed as Meme[];
  } catch {
    // No published memes yet.
  }
  return [];
}

/**
 * Committed memes shipped with the repo under public/memes/. These are
 * available on Vercel (static assets) without any runtime write. Settings
 * come from public/memes/manifest.json; any image file without a manifest
 * entry gets sensible defaults.
 */
async function readCommittedMemes(): Promise<Meme[]> {
  const result: Meme[] = [];
  const seen = new Set<string>();

  try {
    const manifestRaw = await fs.readFile(path.join(PUBLIC_MEMES_DIR, "manifest.json"), "utf8");
    const manifest = JSON.parse(manifestRaw);
    if (Array.isArray(manifest)) {
      for (const entry of manifest) {
        if (!entry || typeof entry !== "object") continue;
        const file = typeof (entry as { file?: unknown }).file === "string" ? (entry as { file: string }).file : "";
        if (!file) continue;
        const id = typeof (entry as { id?: unknown }).id === "string" ? (entry as { id: string }).id : `committed-${file}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const titleRaw = (entry as { title?: unknown }).title;
        const title = sanitizeText(typeof titleRaw === "string" ? titleRaw : file, 200) || file;
        const creatorRaw = (entry as { creator?: unknown }).creator;
        const creator = sanitizeText(typeof creatorRaw === "string" ? creatorRaw : "monk", 80) || "monk";
        const tagsRaw = (entry as { tags?: unknown }).tags;
        const tags = Array.isArray(tagsRaw) ? tagsRaw.map((t) => sanitizeText(t, 40)).filter(Boolean) : [];
        const commentsEnabled = (entry as { commentsEnabled?: unknown }).commentsEnabled !== false;
        const createdAtRaw = (entry as { createdAt?: unknown }).createdAt;
        const createdAt = typeof createdAtRaw === "string" ? createdAtRaw : new Date(0).toISOString();
        result.push({
          id,
          title,
          image: `/memes/${file}`,
          creator,
          tags,
          based: 0,
          laugh: 0,
          createdAt,
          commentsEnabled,
        });
      }
    }
  } catch {
    // No manifest — fall through to auto-discovery.
  }

  try {
    const files = await fs.readdir(PUBLIC_MEMES_DIR);
    const manifestFiles = new Set(result.map((m) => m.image.split("/").pop()));
    for (const f of files) {
      if (!/\.(png|jpe?g|gif|webp)$/i.test(f)) continue;
      if (manifestFiles.has(f)) continue;
      const id = `committed-${f}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({
        id,
        title: f,
        image: `/memes/${f}`,
        creator: "monk",
        tags: [],
        based: 0,
        laugh: 0,
        createdAt: new Date(0).toISOString(),
        commentsEnabled: true,
      });
    }
  } catch {
    // Directory missing (e.g. fresh clone) — ignore.
  }

  return result;
}

async function writeMemes(memes: Meme[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  const tmp = MEMES_FILE + "." + randomUUID() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(memes, null, 2), { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, MEMES_FILE);
}

export async function GET() {
  const committed = await readCommittedMemes();
  const published = await readMemes();
  // Merge committed (repo) + published (dev CLI), dedup by id.
  const seen = new Set<string>();
  const memes: Meme[] = [];
  for (const m of [...committed, ...published]) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    memes.push(m);
  }
  return json(200, { ok: true, memes });
}

export async function POST(req: Request) {
  if (!isDevAuthorized(req)) {
    return json(401, { ok: false, error: "Dev key required." });
  }

  let body: PublishBody;
  try {
    const raw = await req.text();
    if (raw.length > 4_000_000) {
      return json(413, { ok: false, error: "Payload too large." });
    }
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") {
      return json(400, { ok: false, error: "Malformed JSON." });
    }
    body = parsed as PublishBody;
  } catch {
    return json(400, { ok: false, error: "Malformed JSON." });
  }

  const creator = sanitizeText(body.creator, 80);
  if (creator.length < 2) {
    return json(422, { ok: false, error: "Creator handle must be at least 2 characters." });
  }

  const title = sanitizeText(body.title, 200);
  if (title.length < 2) {
    return json(422, { ok: false, error: "Meme title must be at least 2 characters." });
  }

  if (!isValidImage(body.image)) {
    return json(422, { ok: false, error: "Meme image must be a data URL or http(s) URL." });
  }

  if (typeof body.commentsEnabled !== "boolean") {
    return json(422, { ok: false, error: "commentsEnabled must be a boolean." });
  }

  const memes = await readMemes();
  const meme: Meme = {
    id: randomUUID(),
    title,
    image: body.image,
    creator,
    tags: [],
    based: 0,
    laugh: 0,
    createdAt: new Date().toISOString(),
    commentsEnabled: body.commentsEnabled,
  };
  memes.push(meme);
  try {
    await writeMemes(memes);
  } catch {
    return json(500, { ok: false, error: "Could not file published meme." });
  }

  return json(201, { ok: true, meme });
}
