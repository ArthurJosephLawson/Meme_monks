"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Check,
  FileText,
  FileUp,
  Lightbulb,
  Loader2,
  Lock,
  ScrollText,
  ShieldCheck,
  X,
} from "lucide-react";
import { isValidUrl, sanitizeText } from "@/lib/sanitize";
import { BASE_PRICE_NPR, MAX_CONCEPT_LEN, MAX_UPLOAD_BYTES } from "@/lib/application";

type SubmissionType = "UPLOAD" | "CONCEPT_DESCRIPTION";

const ALLOWED_FILE_TYPES: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/gif": "GIF",
  "image/webp": "WebP",
};

const inputClass =
  "h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-soft outline-none transition-colors focus:border-line-strong";
const labelClass = "mb-1 block text-xs font-medium text-muted";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function PolicyModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-title"
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-md border border-line bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="policy-title"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink"
          >
            <ScrollText className="h-4 w-4 text-muted" />
            Content Policy &amp; Pricing Terms
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close policy"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-inset hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted">
          <p className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              <strong className="text-ink">Zero tolerance.</strong> Vulgarity,
              hate speech, harassment, or content targeting protected groups is
              rejected outright and may permanently bar you from the collective.
            </span>
          </p>
          <p className="flex gap-2">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              <strong className="text-ink">Review process.</strong> Every
              application is read by a human curator. Filing does not
              guarantee publishing; you&apos;ll hear back after review.
            </span>
          </p>
          <p className="flex gap-2">
            <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              <strong className="text-ink">Payment.</strong> The baseline fee is{" "}
              {BASE_PRICE_NPR} NPR, payable in cash to the Operations Lead once
              your application is approved. Custom, rare, or complex memes are
              subject to manual price estimation by the team before publishing.
            </span>
          </p>
          <p className="flex gap-2">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              <strong className="text-ink">Publishing rights.</strong> By
              submitting, you confirm you hold the rights to the work and grant
              Meme Monks the right to publish it in the feed with credit.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const [name, setName] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [submissionType, setSubmissionType] = useState<SubmissionType>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [conceptText, setConceptText] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileTooBig = file !== null && file.size > MAX_UPLOAD_BYTES;
  const fileBadType = file !== null && !(file.type in ALLOWED_FILE_TYPES);
  const canSubmit = agreedToPolicy && !submitting && !fileTooBig && !fileBadType;

  function onPickFile(f: File | null) {
    setFile(f);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanName = sanitizeText(name, 80);
    if (cleanName.length < 2) {
      setError("Creator name must be at least 2 characters.");
      return;
    }
    if (!isValidUrl(portfolio)) {
      setError("Portfolio link must be a valid http(s) URL.");
      return;
    }
    if (submissionType === "CONCEPT_DESCRIPTION" && sanitizeText(conceptText).length < 10) {
      setError("Describe the meme concept in at least 10 characters.");
      return;
    }
    if (submissionType === "UPLOAD") {
      if (!file) {
        setError("Attach the meme image you want to publish.");
        return;
      }
      if (fileTooBig || fileBadType) {
        setError("Only PNG, JPEG, GIF, or WebP images up to 5 MB are accepted.");
        return;
      }
    }
    if (!agreedToPolicy) {
      setError("You must accept the Content Policy & Pricing Terms.");
      return;
    }

    setSubmitting(true);
    try {
      let res: Response;
      if (submissionType === "UPLOAD") {
        const body = new FormData();
        body.set("name", cleanName);
        body.set("portfolio", portfolio.trim());
        body.set("submissionType", "UPLOAD");
        body.set("agreedToPolicy", "true");
        body.set("file", file as File);
        res = await fetch("/api/apply", { method: "POST", body });
      } else {
        res = await fetch("/api/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cleanName,
            portfolio: portfolio.trim(),
            submissionType: "CONCEPT_DESCRIPTION",
            conceptText: sanitizeText(conceptText, MAX_CONCEPT_LEN),
            agreedToPolicy: true,
          }),
        });
      }
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
            The curators will review your submission. You&apos;ll hear back
            after review — bring {BASE_PRICE_NPR} NPR in cash for the Operations
            Lead if approved, or the estimated price for custom work.
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
      {policyOpen && <PolicyModal onClose={() => setPolicyOpen(false)} />}

      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          Apply to upload
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Posting rights are reviewed, not automatic. Baseline fee is{" "}
          {BASE_PRICE_NPR} NPR — see the pricing terms below.
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="https://yourwork.example"
            maxLength={500}
            required
            className={inputClass}
          />
        </div>

        {/* Submission type — flat segmented toggle */}
        <fieldset>
          <legend className={labelClass}>Submission type</legend>
          <div
            role="radiogroup"
            aria-label="Submission type"
            className="grid grid-cols-2 gap-2"
          >
            {(
              [
                { id: "UPLOAD", label: "Upload meme", icon: FileUp, hint: "You have the image ready" },
                {
                  id: "CONCEPT_DESCRIPTION",
                  label: "Describe concept",
                  icon: Lightbulb,
                  hint: "Our team designs it",
                },
              ] as const
            ).map(({ id, label, icon: Icon, hint }) => {
              const active = submissionType === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSubmissionType(id)}
                  className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-line-strong bg-inset-strong"
                      : "border-line bg-surface hover:bg-inset"
                  }`}
                >
                  <span
                    className={`flex items-center gap-1.5 text-sm font-medium ${active ? "text-ink" : "text-muted"}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-faint">{hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {submissionType === "UPLOAD" ? (
          <div>
            <label htmlFor="file" className={labelClass}>
              Meme image — PNG, JPEG, GIF, or WebP, max {formatBytes(MAX_UPLOAD_BYTES)}
            </label>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept={Object.keys(ALLOWED_FILE_TYPES).join(",")}
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-md border border-line bg-surface text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:border-r file:border-line file:bg-inset file:px-3 file:py-2 file:text-xs file:font-medium file:text-ink"
            />
            {file && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-faint">
                <FileText className="h-3 w-3" />
                <span className="truncate text-muted">{file.name}</span> —{" "}
                {formatBytes(file.size)}
              </p>
            )}
            {(fileTooBig || fileBadType) && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-700">
                <AlertTriangle className="h-3 w-3" />
                {fileTooBig
                  ? "File exceeds the 5 MB limit."
                  : "Only PNG, JPEG, GIF, or WebP images are accepted."}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="concept" className={labelClass}>
              Meme concept — our team designs it for you
            </label>
            <textarea
              id="concept"
              value={conceptText}
              onChange={(e) => setConceptText(e.target.value)}
              placeholder="Describe the idea: format, caption, reference…"
              maxLength={MAX_CONCEPT_LEN}
              rows={4}
              className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-soft outline-none transition-colors focus:border-line-strong"
            />
            <p className="mt-1 text-right text-[11px] text-faint">
              {conceptText.length}/{MAX_CONCEPT_LEN}
            </p>
          </div>
        )}

        {/* Pricing disclosure — flat container */}
        <div className="rounded-md border border-line bg-inset p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Banknote className="h-3.5 w-3.5 text-muted" />
            Pricing — {BASE_PRICE_NPR} NPR baseline
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            The standard baseline fee is{" "}
            <span className="text-ink">{BASE_PRICE_NPR} NPR</span>, payable in{" "}
            <span className="text-ink">cash to the Operations Lead</span> upon
            approval. Custom, rare, or complex memes are subject to{" "}
            <span className="text-ink">manual price estimation</span> by the
            team — you&apos;ll be told the final price before anything is
            charged or published.
          </p>
        </div>

        {/* Policy agreement — gates submission */}
        <div className="rounded-md border border-line bg-surface p-3">
          <button
            type="button"
            onClick={() => setPolicyOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
          >
            <ScrollText className="h-3.5 w-3.5" />
            Read the Content Policy &amp; Pricing Terms
          </button>
          <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-muted">
            <input
              type="checkbox"
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              required
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#647b96]"
            />
            <span>
              I have read and agree to the Meme Monks Content Policy &amp;
              Pricing Terms.
            </span>
          </label>
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
          disabled={!canSubmit}
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
