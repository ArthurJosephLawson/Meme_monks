"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Lock, ArrowLeft } from "lucide-react";
import { isValidUrl, sanitizeText } from "@/lib/sanitize";

interface FormState {
  name: string;
  portfolio: string;
  sample: string;
}

const EMPTY: FormState = { name: "", portfolio: "", sample: "" };

const inputClass =
  "h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-soft outline-none transition-colors focus:border-line-strong";
const labelClass = "mb-1 block text-xs font-medium text-muted";

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
        setError(data.error ?? "Submission failed. Try again.");
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
      <div className="mx-auto max-w-xl px-4 py-10 md:px-6">
        <div className="rounded-md border border-line bg-surface px-4 py-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-inset-strong text-ink">
            <Check className="h-5 w-5" strokeWidth={2} />
          </span>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink">
            Application received
          </h1>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            The curators will review your submission. You&apos;ll hear back by email.
          </p>
          <p className="mt-3 text-xs text-faint">
            Reference: <span className="tabular-nums text-muted">{refId}</span>
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          Apply to upload
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Posting rights are reviewed, not automatic. A one-time $5.00 vetting fee
          keeps the feed clean.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
        <div>
          <label htmlFor="name" className={labelClass}>
            Creator name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Juniper Vale"
            maxLength={80}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="portfolio" className={labelClass}>
            Portfolio or social link
          </label>
          <input
            id="portfolio"
            type="url"
            value={form.portfolio}
            onChange={(e) => set("portfolio", e.target.value)}
            placeholder="https://yourwork.example"
            maxLength={500}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="sample" className={labelClass}>
            Sample meme URL
          </label>
          <input
            id="sample"
            type="url"
            value={form.sample}
            onChange={(e) => set("sample", e.target.value)}
            placeholder="https://i.yourmemes.example/best.png"
            maxLength={500}
            required
            className={inputClass}
          />
        </div>

        {/* Payment section — flat container, Stripe placeholder */}
        <div className="rounded-md border border-line bg-inset p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Lock className="h-3.5 w-3.5 text-muted" />
            Payment — $5.00 vetting fee
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Card capture is handled by Stripe Checkout. It&apos;s a placeholder in
            this build — wire your publishable key and Checkout Session into{" "}
            <span className="text-ink">app/api/apply/route.ts</span> to charge the
            fee before an application is filed.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </button>
      </form>
    </div>
  );
}
