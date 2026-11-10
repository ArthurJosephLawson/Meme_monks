import { NextResponse, type NextRequest } from "next/server";

/**
 * Content-Security-Policy with a per-request nonce (Next.js official
 * recipe). Next injects the nonce into its own bootstrap scripts; the
 * layout reads `x-nonce` for the theme-init inline script.
 *
 * Note: issuing a nonce makes routes dynamic. Acceptable trade — the
 * protection against script injection outweighs HTML caching here.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    // 'strict-dynamic' lets Next's nonce-stamped loader pull its own chunks.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Tailwind ships as an external stylesheet; 'unsafe-inline' stays for
    // framework-injected styles only.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Skip Next internals and static assets; apply to everything else.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|logo.png).*)"],
};
