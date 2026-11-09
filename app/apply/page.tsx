"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Lock, ArrowLeft, Terminal } from "lucide-react";
import { isValidUrl, sanitizeText } from "@/lib/sanitize";

interface FormState {
  name: string;
  portfolio: string;
  sample: string;
}

const EMPTY: FormState = { name: "", portfolio: "", sample: "" };

export default function ApplyPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const name = sanitizeText(form.name, 80);
    if (name.length < 2) {
      setError("Creator name must be at least 2 characters.");
      return;
    }
    if (!isValidUrl(form.portfolio)) {
      setError("Portfolio link must be a valid http(s) URL.");
      return;
    }
    if (!isValidUrl(form.sample)) {
      setError("Sample meme URL must be a valid http(s) URL.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          portfolio: form.portfolio.trim(),
          sample: form.sample.trim(),
        }),
      });
      const data = (await res.json()) as { ok: boolean; id?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Transmission failed. Try again.");
        return;
      }
      setRefId(data.id ?? "unknown");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (refId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
        <div className="border border-neon/60 bg-panel p-8 text-center box-glow">
          <span className="mx-auto flex h-12 w-12 items-center justify-center border border-neon bg-neon/15 text-neon">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-5 font-mono text-xl font-bold tracking-wide text-neon text-glow">
            APPLICATION FILED
          </h1>
          <p className="mt-3 text-sm text-dim">
            The elders will review your transmission. Watch your inbox for judgment.
          </p>
          <p className="mt-4 inline-block border border-edge bg-ink px-4 py-2 font-mono text-xs text-neon">
            REF: {refId}
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs text-dim transition-colors hover:border-neon/50 hover:text-neon"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO FEED
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.3em] text-neon text-glow">
          RITES://ENTRY
        </p>
        <h1 className="mt-1 font-mono text-2xl font-bold tracking-wide text-zinc-100">
          APPLY TO UPLOAD
        </h1>
        <p className="mt-2 text-sm text-dim">
          Posting rights are earned, not given. A one-time vetting fee of{" "}
          <span className="font-mono text-neon">$5.00</span> keeps the feed free of
          noise. Approved monks transmit directly to the feed.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="name"
            className="block font-mono text-[11px] tracking-[0.25em] text-dim"
          >
            01 // CREATOR NAME
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Juniper Vale"
            maxLength={80}
            required
            className="mt-2 w-full border border-edge bg-panel px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-dim/40 outline-none transition-colors focus:border-neon focus:box-glow"
          />
        </div>

        <div>
          <label
            htmlFor="portfolio"
            className="block font-mono text-[11px] tracking-[0.25em] text-dim"
          >
            02 // PORTFOLIO / SOCIAL LINK
          </label>
          <input
            id="portfolio"
            type="url"
            value={form.portfolio}
            onChange={(e) => set("portfolio", e.target.value)}
            placeholder="https://yourwork.example"
            maxLength={500}
            required
            className="mt-2 w-full border border-edge bg-panel px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-dim/40 outline-none transition-colors focus:border-neon focus:box-glow"
          />
        </div>

        <div>
          <label
            htmlFor="sample"
            className="block font-mono text-[11px] tracking-[0.25em] text-dim"
          >
            03 // SAMPLE MEME URL
          </label>
          <input
            id="sample"
            type="url"
            value={form.sample}
            onChange={(e) => set("sample", e.target.value)}
            placeholder="https://i.yourmemes.example/best.png"
            maxLength={500}
            required
            className="mt-2 w-full border border-edge bg-panel px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-dim/40 outline-none transition-colors focus:border-neon focus:box-glow"
          />
        </div>

        {/* Stripe placeholder */}
        <div className="border border-dashed border-neon/40 bg-neon/5 p-4">
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-neon">
            <Lock className="h-3.5 w-3.5" /> STRIPE CHECKOUT
          </p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-dim">
            [INTEGRATION PLACEHOLDER] Card capture is disabled in this scaffold.
            Wire your Stripe publishable key + Checkout Session into
            <span className="text-zinc-300"> app/api/apply/route.ts</span> to
            charge the $5.00 vetting fee before submission.
          </p>
        </div>

        {error && (
          <p role="alert" className="border border-red-500/50 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-400">
            ERR: {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 border border-neon bg-neon px-4 py-3.5 font-mono text-sm font-bold tracking-wide text-ink transition-shadow hover:box-glow disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> TRANSMITTING…
            </>
          ) : (
            <>
              <Terminal className="h-4 w-4" strokeWidth={2.4} /> SUBMIT APPLICATION — $5.00
            </>
          )}
        </button>
      </form>
    </div>
  );
}
