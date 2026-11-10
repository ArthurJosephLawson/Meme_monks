#!/usr/bin/env node
/**
 * Meme Monks dev terminal CLI — publish flow.
 *
 * Dev authenticates with the passkey, then supplies the meme details that
 * the Operations Lead approved after a client application was filed.
 *
 * Flow:
 *   1. Prompt dev passkey ("5cr1pt@m0nks").
 *   2. On success, prompt: uploader username, actual meme, caption, comments toggle.
 *   3. POST the meme to the local site API (dev-gated).
 */
import process from "node:process";
import fs from "node:fs";
import path from "node:path";

const DEV_PASSPORD = "5cr1pt@m0nks";
const API_URL = process.env.MEME_MONKS_API_URL ?? "http://localhost:3000";

// Line-driven ask: resolves on the next stdin line. Works with piped and
// interactive stdin alike.
function createAsk() {
  const waiters = [];
  const lines = [];
  let buffer = "";
  const pump = () => {
    while (waiters.length > 0 && lines.length > 0) {
      const { resolve } = waiters.shift();
      resolve(lines.shift());
    }
  };
  const onData = (chunk) => {
    buffer += chunk.toString();
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).replace(/\r$/, "");
      buffer = buffer.slice(idx + 1);
      lines.push(line);
    }
    pump();
  };
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", onData);
  const ask = (q) =>
    new Promise((resolve) => {
      console.log(q);
      waiters.push({ resolve });
      pump();
    });
  return ask;
}

const ask = createAsk();

const passkey = await ask("Dev passkey: ");
if (passkey !== DEV_PASSPORD) {
  console.log("ACCESS DENIED — publish aborted.");
  process.exit(1);
}
console.log("PASSKEY ACCEPTED — gathering meme details.");

const username = await ask("Uploader username (creator handle): ");
const memeInput = await ask("Actual meme (image file path, or leave empty for title-only): ");
const caption = await ask("Caption for the meme: ");
const commentsAnswer = await ask("Enable comments on this meme? (y/N): ");
const commentsEnabled = /^(y|yes)$/i.test(commentsAnswer);

function resolveMemeImage() {
  const trimmed = memeInput.trim();
  if (!trimmed) return "";
  const abs = path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
  const stat = fs.existsSync(abs) ? fs.statSync(abs) : null;
  if (!stat?.isFile()) {
    console.log(`Meme file not found: ${abs}`);
    process.exit(1);
  }
  const ext = path.extname(abs).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : `image/${ext.slice(1)}`;
  const buffer = fs.readFileSync(abs);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

const image = resolveMemeImage();
if (memeInput.trim() && !image) process.exit(1);

const title = caption.trim() || memeInput.trim();
if (!title) {
  console.log("Meme title/caption cannot be empty — publish aborted.");
  process.exit(1);
}

console.log(`Publishing meme for @${username} — "${title}"...`);

const res = await fetch(`${API_URL}/api/memes`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-dev-key": DEV_PASSPORD,
  },
  body: JSON.stringify({
    creator: username,
    title,
    image,
    commentsEnabled,
  }),
});

const data = await res.json().catch(() => ({}));
if (!res.ok || !data.ok) {
  console.log(`Publish failed (${res.status}): ${data.error ?? "unknown error"}`);
  process.exit(1);
}

console.log(`Published. Ref: ${data.meme?.id ?? "unknown"}`);
console.log(`Meme: ${data.meme?.title ?? title}`);
console.log(`Creator: @${data.meme?.creator ?? username}`);
console.log(`Comments: ${data.meme?.commentsEnabled ? "enabled" : "disabled"}`);

process.exit(0);
