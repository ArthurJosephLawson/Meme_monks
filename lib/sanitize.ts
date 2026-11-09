const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

/**
 * Collapse and cap free-text input. Strips control characters, NFKC
 * normalizes, collapses whitespace. Never trust it alone for HTML output —
 * React escapes on render; never pass values to dangerouslySetInnerHTML.
 */
export function sanitizeText(input: unknown, max = 200): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFKC")
    .replace(CONTROL_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Accept only absolute http(s) URLs. Returns "" for anything else
 * (javascript:, data:, malformed, non-strings).
 */
export function sanitizeUrl(input: unknown, max = 500): string {
  const raw = sanitizeText(input, max);
  if (!raw) return "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "";
  return url.toString();
}

export function isValidUrl(input: unknown): boolean {
  return sanitizeUrl(input) !== "";
}
