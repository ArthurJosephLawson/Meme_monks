/**
 * Pure validation rules for creator applications. No framework or fs
 * access here — everything is testable without HTTP.
 */
import { createHash } from "crypto";
import { sanitizeText, sanitizeUrl } from "./sanitize.ts";

export const SUBMISSION_TYPES = ["UPLOAD", "CONCEPT_DESCRIPTION"] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

/** Baseline filing fee in NPR. Custom/rare/complex work is re-estimated by the team. */
export const BASE_PRICE_NPR = 20;

export const MAX_NAME_LEN = 80;
export const MAX_PORTFOLIO_LEN = 500;
export const MAX_CONCEPT_LEN = 2000;

/** Hard cap for uploaded meme assets: 5 MB. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** MIME type → file extension whitelist. Both must agree. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export interface ValidatedApplication {
  name: string;
  portfolio: string;
  submissionType: SubmissionType;
  /** Set for UPLOAD: stored asset filename inside .data/uploads. */
  assetPath?: string;
  /** Set for CONCEPT_DESCRIPTION: sanitized concept text. */
  conceptText?: string;
  basePriceNpr: number;
  agreedToPolicy: true;
}

export type ValidationFailure = { field: string; message: string };

export interface UploadMeta {
  size: number;
  type: string;
  /** Original client filename; only the extension is ever read from it. */
  name: string;
}

/**
 * Validate the JSON/text portion of an application. Returns a validated
 * record or a list of field failures. `assetPath` is attached later by the
 * route after the upload is persisted.
 */
export function validateApplication(
  input: {
    name?: unknown;
    portfolio?: unknown;
    submissionType?: unknown;
    conceptText?: unknown;
    agreedToPolicy?: unknown;
  },
  fileMeta?: UploadMeta,
): { ok: true; value: ValidatedApplication } | { ok: false; failures: ValidationFailure[] } {
  const failures: ValidationFailure[] = [];

  const name = sanitizeText(input.name, MAX_NAME_LEN);
  if (name.length < 2) {
    failures.push({ field: "name", message: "Creator name must be at least 2 characters." });
  }

  const portfolio = sanitizeUrl(input.portfolio, MAX_PORTFOLIO_LEN);
  if (!portfolio) {
    failures.push({ field: "portfolio", message: "Portfolio link must be a valid http(s) URL." });
  }

  const submissionType = input.submissionType;
  if (typeof submissionType !== "string" || !SUBMISSION_TYPES.includes(submissionType as SubmissionType)) {
    failures.push({ field: "submissionType", message: "Submission type must be UPLOAD or CONCEPT_DESCRIPTION." });
  }

  // Policy agreement must be the literal boolean true — "true", 1, or
  // truthy values are rejected.
  if (input.agreedToPolicy !== true) {
    failures.push({ field: "agreedToPolicy", message: "You must accept the Content Policy & Pricing Terms." });
  }

  let conceptText: string | undefined;
  if (submissionType === "CONCEPT_DESCRIPTION") {
    conceptText = sanitizeText(input.conceptText, MAX_CONCEPT_LEN);
    if (conceptText.length < 10) {
      failures.push({
        field: "conceptText",
        message: "Describe the meme concept in at least 10 characters.",
      });
    }
  }

  if (submissionType === "UPLOAD" && fileMeta) {
    const fail = validateUploadMeta(fileMeta);
    if (fail) failures.push(fail);
  }

  if (failures.length > 0) return { ok: false, failures };

  return {
    ok: true,
    value: {
      name,
      portfolio: portfolio as string,
      submissionType: submissionType as SubmissionType,
      conceptText,
      // Price is server-owned: baseline at filing, manual estimation later.
      basePriceNpr: BASE_PRICE_NPR,
      agreedToPolicy: true,
    },
  };
}

/** Size + declared MIME + extension triple-check for an upload. */
export function validateUploadMeta(meta: UploadMeta): ValidationFailure | null {
  if (meta.size <= 0 || meta.size > MAX_UPLOAD_BYTES) {
    return { field: "file", message: "File must be between 1 byte and 5 MB." };
  }
  const ext = ALLOWED_IMAGE_TYPES[meta.type];
  if (!ext) {
    return { field: "file", message: "Only PNG, JPEG, GIF, or WebP images are accepted." };
  }
  const nameExt = meta.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  // Treat .jpeg as the .jpg twin.
  const normalized = nameExt === ".jpeg" ? ".jpg" : nameExt;
  if (normalized !== ext) {
    return { field: "file", message: "File extension does not match its content type." };
  }
  return null;
}

/**
 * Identify an image by magic bytes — the client-declared MIME type and
 * filename are attacker-controlled and trusted for nothing. Returns the
 * canonical MIME type or null when the bytes match no allowed format.
 */
export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // GIF: "GIF87a" / "GIF89a"
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  ) {
    return "image/gif";
  }
  // WebP: "RIFF" + 4 bytes + "WEBP"
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Content fingerprint for deduplication: prevents the same user from
 * applying with the same meme twice. UPLOAD uses the file bytes; concepts
 * use the normalized text. Never trust client-supplied ids.
 */
export function applicationFingerprint(input: {
  submissionType: SubmissionType;
  name: string;
  conceptText?: string;
  fileBytes?: Buffer;
}): string {
  const h = createHash("sha256");
  h.update(input.submissionType);
  h.update("\u0000");
  h.update(input.name.toLowerCase().trim());
  if (input.submissionType === "CONCEPT_DESCRIPTION") {
    h.update("\u0000");
    h.update((input.conceptText ?? "").toLowerCase().replace(/\s+/g, " "));
  } else if (input.fileBytes) {
    h.update("\u0000");
    h.update(input.fileBytes);
  }
  return h.digest("hex");
}
