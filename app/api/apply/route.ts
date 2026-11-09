import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

// Hard request-size cap: applications are small structured JSON.
const MAX_BODY_BYTES = 10_000;

// .data/ is the scaffold's file-based admin inbox. Swap for a DB or
// transactional email (e.g. Resend/SES) when wiring real infrastructure.
const DATA_DIR = path.join(process.cwd(), ".data");
const INBOX_FILE = path.join(DATA_DIR, "applications.json");

interface StoredApplication {
  id: string;
  createdAt: string;
  name: string;
  portfolio: string;
  sample: string;
  status: "pending";
}

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json(415, { ok: false, error: "Expected application/json." });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
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

  // Server-side sanitization never trusts client input.
  const name = sanitizeText(body.name, 80);
  const portfolio = sanitizeUrl(body.portfolio);
  const sample = sanitizeUrl(body.sample);

  if (name.length < 2) {
    return json(422, { ok: false, error: "Creator name must be at least 2 characters." });
  }
  if (!portfolio) {
    return json(422, { ok: false, error: "Portfolio link must be a valid http(s) URL." });
  }
  if (!sample) {
    return json(422, { ok: false, error: "Sample meme URL must be a valid http(s) URL." });
  }

  // Stripe placeholder: in production, verify a paid Checkout Session
  // (or webhook event) for this applicant BEFORE filing the application.
  // See the placeholder panel on /apply.
  const application: StoredApplication = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    portfolio,
    sample,
    status: "pending",
  };

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let applications: StoredApplication[] = [];
    try {
      applications = JSON.parse(await fs.readFile(INBOX_FILE, "utf8")) as StoredApplication[];
      if (!Array.isArray(applications)) applications = [];
    } catch {
      // First application — file does not exist yet.
    }
    applications.push(application);
    await fs.writeFile(INBOX_FILE, JSON.stringify(applications, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
  } catch {
    return json(500, { ok: false, error: "Could not file application." });
  }

  // Admin inbox routing placeholder: emitted to the server log for now.
  console.log(
    `[meme-monks] new application ${application.id} from "${name}" — pending review`,
  );

  return json(201, { ok: true, id: application.id });
}
