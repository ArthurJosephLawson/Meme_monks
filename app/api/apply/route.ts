import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  validateApplication,
  validateUploadMeta,
  sniffImageType,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  BASE_PRICE_NPR,
  applicationFingerprint,
  type ValidatedApplication,
  type SubmissionType,
} from "@/lib/application";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { sendApplicationEmail } from "@/lib/mailer";

// Applications are small; uploads are capped at 5 MB (plus multipart
// overhead). Enforced again per-file below — this is the transport cap.
const MAX_BODY_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;

// Rate limit: 5 applications per 15 minutes per client IP.
const RATE_MAX = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

// .data/ is the file-based admin inbox. Swap for a DB or transactional
// email when wiring real infrastructure. Never serve .data/ or uploads
// through /public — uploaded files are admin-reviewed only.
const DATA_DIR = path.join(process.cwd(), ".data");
const INBOX_FILE = path.join(DATA_DIR, "applications.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const FINGERPRINTS_FILE = path.join(DATA_DIR, "fingerprints.json");

interface StoredApplication {
  id: string;
  createdAt: string;
  name: string;
  portfolio: string;
  submissionType: SubmissionType;
  assetPath?: string;
  conceptText?: string;
  basePriceNpr: number;
  agreedToPolicy: true;
  status: "pending";
}

function json(status: number, body: Record<string, unknown>, extraHeaders?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

// Serialized read-modify-write on the inbox file. Node handles requests
// concurrently; naive append would race and drop applications.
let inboxQueue: Promise<void> = Promise.resolve();
function enqueueInboxWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = inboxQueue.then(task, task);
  inboxQueue = next.then(() => undefined, () => undefined);
  return next;
}

async function fileApplication(application: StoredApplication): Promise<void> {
  await enqueueInboxWrite(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
    let applications: StoredApplication[] = [];
    try {
      const parsed = JSON.parse(await fs.readFile(INBOX_FILE, "utf8"));
      if (Array.isArray(parsed)) applications = parsed;
    } catch {
      // First application — file does not exist yet.
    }
    applications.push(application);

    // Atomic write: temp file, then rename. Mode 0600 keeps the inbox
    // private to the process owner.
    const tmp = INBOX_FILE + "." + randomUUID() + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(applications, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    await fs.rename(tmp, INBOX_FILE);
  });
}

async function readFingerprints(): Promise<string[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FINGERPRINTS_FILE, "utf8"));
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
  } catch {
    // No fingerprints yet.
  }
  return [];
}

async function writeFingerprints(list: string[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
  const tmp = FINGERPRINTS_FILE + "." + randomUUID() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, FINGERPRINTS_FILE);
}

async function storeUpload(file: File): Promise<string | undefined> {
  const meta = { size: file.size, type: file.type, name: file.name };
  if (validateUploadMeta(meta)) return undefined;

  // Content sniffing: declared MIME and filename are attacker-controlled.
  // The magic bytes are ground truth — reject anything that is not a
  // real image of the declared kind.
  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);
  if (!sniffed || sniffed !== file.type) return undefined;

  // Filename is fully server-generated: random UUID + whitelisted
  // extension. Client filenames never touch the filesystem.
  const ext = ALLOWED_IMAGE_TYPES[sniffed];
  const stored = `${randomUUID()}${ext}`;

  await fs.mkdir(UPLOADS_DIR, { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(UPLOADS_DIR, stored), buffer, { mode: 0o600 });
  return stored;
}

export async function POST(req: Request) {
  // Rate limit first — before parsing anything expensive.
  const key = clientKey(req);
  const limit = rateLimit(`apply:${key}`, { max: RATE_MAX, windowMs: RATE_WINDOW_MS });
  if (!limit.allowed) {
    return json(429, { ok: false, error: "Too many applications. Try again later." }, {
      "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: "Payload too large." });
  }

  const contentType = req.headers.get("content-type") ?? "";

  let result: ReturnType<typeof validateApplication>;
  let upload: File | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      upload = file instanceof File && file.size > 0 ? file : null;

      result = validateApplication(
        {
          name: form.get("name"),
          portfolio: form.get("portfolio"),
          submissionType: form.get("submissionType"),
          conceptText: form.get("conceptText"),
          agreedToPolicy: form.get("agreedToPolicy") === "true",
        },
        upload ? { size: upload.size, type: upload.type, name: upload.name } : undefined,
      );
      if (!result.ok) return failuresResponse(result);
      if (result.value.submissionType === "UPLOAD" && !upload) {
        return json(422, { ok: false, error: "Attach the meme image you want to publish." });
      }
      if (result.value.submissionType === "CONCEPT_DESCRIPTION") {
        // Concepts never carry files.
        upload = null;
      }
    } else if (contentType.includes("application/json")) {
      const raw = await req.text();
      if (raw.length > 16_000) {
        return json(413, { ok: false, error: "Payload too large." });
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return json(400, { ok: false, error: "Malformed JSON." });
      }
      if (parsed === null || typeof parsed !== "object") {
        return json(400, { ok: false, error: "Malformed JSON." });
      }
      const body = parsed as Record<string, unknown>;
      result = validateApplication(body);
      if (!result.ok) return failuresResponse(result);
      if (result.value.submissionType === "UPLOAD") {
        return json(422, { ok: false, error: "UPLOAD submissions must be sent as multipart/form-data." });
      }
    } else {
      return json(415, { ok: false, error: "Expected application/json or multipart/form-data." });
    }
  } catch {
    // formData()/arrayBuffer() can throw on truncated or hostile bodies.
    return json(400, { ok: false, error: "Could not read submission." });
  }

  const validated = result.value;

  // Persist the upload (if any) only after validation passed.
  let assetPath: string | undefined;
  if (upload) {
    try {
      assetPath = await storeUpload(upload);
    } catch {
      return json(500, { ok: false, error: "Could not store the uploaded file." });
    }
    if (!assetPath) {
      return json(422, { ok: false, error: "Only PNG, JPEG, GIF, or WebP images up to 5 MB are accepted." });
    }
  }

  // Dedup: reject if this user already applied with this exact meme.
  const fingerprint = upload
    ? applicationFingerprint({
        submissionType: validated.submissionType,
        name: validated.name,
        fileBytes: Buffer.from(await upload.arrayBuffer()),
      })
    : applicationFingerprint({
        submissionType: validated.submissionType,
        name: validated.name,
        conceptText: validated.conceptText,
      });

  const existingFingerprints = await readFingerprints();
  if (existingFingerprints.includes(fingerprint)) {
    if (assetPath) {
      await fs.rm(path.join(UPLOADS_DIR, assetPath), { force: true }).catch(() => {});
    }
    return json(409, { ok: false, error: "You have already applied with this meme." });
  }

  const application: StoredApplication = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: validated.name,
    portfolio: validated.portfolio,
    submissionType: validated.submissionType,
    ...(assetPath ? { assetPath } : {}),
    ...(validated.conceptText ? { conceptText: validated.conceptText } : {}),
    basePriceNpr: validated.basePriceNpr,
    agreedToPolicy: true,
    status: "pending",
  };

  try {
    await fileApplication(application);
  } catch {
    // Roll back the stored asset so orphans don't accumulate.
    if (assetPath) {
      await fs.rm(path.join(UPLOADS_DIR, assetPath), { force: true }).catch(() => {});
    }
    return json(500, { ok: false, error: "Could not file application." });
  }

  // Persist dedup fingerprint so the same meme can't be applied twice.
  try {
    await writeFingerprints([...existingFingerprints, fingerprint]);
  } catch {
    // Non-fatal: filing already succeeded.
  }

  // Admin inbox routing placeholder: ref + type only — never names,
  // portfolio links, or concept text in logs.
  console.log(`[meme-monks] application ${application.id} filed type=${application.submissionType}`);

  // Detailed operations email: applicant name + description or uploaded
  // meme picture. Filing is already durably persisted; mail failure must not
  // roll it back, so errors are logged and swallowed here.
  try {
    await sendApplicationEmail({
      id: application.id,
      name: application.name,
      portfolio: application.portfolio,
      submissionType: application.submissionType,
      assetPath: application.assetPath,
      conceptText: application.conceptText,
      basePriceNpr: application.basePriceNpr,
      agreedToPolicy: true,
      status: application.status,
      createdAt: application.createdAt,
    });
  } catch (e) {
    console.error(
      `[meme-monks] application email send failed id=${application.id}`,
      (e as Error)?.message ?? "unknown error",
    );
  }

  return json(201, {
    ok: true,
    id: application.id,
    basePriceNpr: BASE_PRICE_NPR,
  });
}

function failuresResponse(result: { ok: false; failures: { field: string; message: string }[] }) {
  return json(422, {
    ok: false,
    error: result.failures[0]?.message ?? "Invalid application.",
    failures: result.failures,
  });
}
