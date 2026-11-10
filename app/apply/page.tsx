"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
// No lucide-react icons.
import { sanitizeText } from "@/lib/sanitize";
import { MAX_CONCEPT_LEN, MAX_UPLOAD_BYTES, isValidContact } from "@/lib/application";

type SubmissionType = "UPLOAD" | "CONCEPT_DESCRIPTION";

const ALLOWED_FILE_TYPES: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/gif": "GIF",
  "image/webp": "WebP",
};

const inputClass =
  "h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-soft outline-none focus:border-line-strong";
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
            Terms and Conditions
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close policy"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted "
          >
            ×
          </button>
        </div>

        <div className="mt-3 max-h-[50vh] overflow-y-auto pr-1 text-xs leading-relaxed text-muted">
          <h3 className="mb-2 text-sm font-semibold text-ink">Terms and Conditions</h3>
          <p className="mb-2">
            By accessing, browsing, or using Meme Monks (&quot;the Platform&quot;),
            you agree to be bound by the following legally binding Terms and
            Conditions:
          </p>
          <p className="mb-1 font-medium text-ink">User Content, Adaptations &amp; IP Clearance (DMCA &amp; Liability Shield):</p>
          <p className="mb-2">
            Open-Source &amp; Derived Memes: Users are permitted to use open-source,
            public-domain, or widespread internet meme formats/templates (e.g.,
            from Pinterest or Google Images). However, any custom edits, captions,
            or arrangements submitted remain the sole responsibility of the
            uploader.
          </p>
          <p className="mb-2">
            Indemnification: You represent that your submissions do not infringe on
            proprietary software, private personal property, or trademarked
            material outside fair-use internet humor. You agree to fully indemnify,
            defend, and hold harmless Meme Monks and its operators against any
            copyright claims, legal fees, or third-party liabilities arising from
            your content.
          </p>
          <p className="mb-2">
            License to Feature: By submitting a meme, you grant Meme Monks a
            non-exclusive, royalty-free, worldwide license to host, display,
            reformat, and feature your submission across the Platform.
          </p>
          <p className="mb-1 font-medium text-ink">Application &amp; Evaluation Fees:</p>
          <p className="mb-2">
            Conditional Vetting Fee: Standard meme applications do not carry a
            mandatory fee. Meme Monks reserves the sole right to assess a nominal
            evaluation or curation fee (e.g., NPR 50.00 or an amount determined
            by the Platform) for special, high-tier, complex, or custom-category
            meme submissions.
          </p>
          <p className="mb-2">
            Email Notification &amp; Invoicing: If an application is designated for a
            special evaluation fee, payment instructions and invoice details will
            be sent directly to the applicant&apos;s provided email or Instagram.
          </p>
          <p className="mb-2">
            Non-Refundable Processing: Paid evaluation fees cover the
            administrative review of special applications and are strictly
            non-refundable. Payment of a fee does not guarantee approval or
            permanent placement on the main feed.
          </p>
          <p className="mb-1 font-medium text-ink">Content Moderation &amp; Account Right of Removal:</p>
          <p className="mb-2">
            Zero Tolerance: You may not submit hate speech, illegal content,
            harassment, malware, or malicious scripts.
          </p>
          <p className="mb-2">
            Discretionary Removal: Meme Monks reserves the absolute right to
            reject, remove, or unpublish any meme, or suspend uploader privileges
            at any time without prior notice.
          </p>
          <p className="mb-1 font-medium text-ink">Limitation of Liability:</p>
          <p className="mb-2">
            &quot;As-Is&quot; Service: The Platform is provided on an &quot;AS IS&quot; basis.
            Meme Monks is not liable for data loss, server downtime, or user
            interactions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
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
    if (!isValidContact(contact.trim())) {
      setError("Enter a valid email address or Instagram username.");
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
        body.set("contact", contact.trim());
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
            contact: contact.trim(),
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
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-inset-strong text-sm font-semibold text-ink">
            OK
          </span>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink">
            Application received
          </h1>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            The curators will review your submission. You&apos;ll hear back
            after review. You will be contacted using the email or Instagram handle you provided.
          </p>
          <p className="mt-3 text-xs text-faint">
            Reference: <span className="tabular-nums text-muted">{refId}</span>
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent "
          >
            Back to feed
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
          Posting rights are reviewed, not automatic. Please read and accept the
          Terms and Conditions before submitting.
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
          <label htmlFor="contact" className={labelClass}>
            Email or Instagram username
          </label>
          <input
            id="contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@example.com or @yourhandle"
            maxLength={120}
            required
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-faint">
            Used to contact you about your application.
          </p>
        </div>

        {/* Submission type - flat segmented toggle */}
        <fieldset>
          <legend className={labelClass}>Submission type</legend>
          <div
            role="radiogroup"
            aria-label="Submission type"
            className="grid grid-cols-2 gap-2"
          >
            {(
              [
                { id: "UPLOAD", label: "Upload meme", hint: "You have the image ready" },
                {
                  id: "CONCEPT_DESCRIPTION",
                  label: "Describe concept",
                  hint: "Our team designs it",
                },
              ] as const
            ).map(({ id, label, hint }) => {
              const active = submissionType === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSubmissionType(id)}
                  className={`rounded-md border px-3 py-2.5 text-left ${
                    active
                      ? "border-line-strong bg-inset-strong"
                      : "border-line bg-surface "
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${active ? "text-ink" : "text-muted"}`}
                  >
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
              Meme image - PNG, JPEG, GIF, or WebP, max {formatBytes(MAX_UPLOAD_BYTES)}
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
              <p className="mt-1 text-[11px] text-faint">
                <span className="truncate text-muted">{file.name}</span> -{" "}
                {formatBytes(file.size)}
              </p>
            )}
            {(fileTooBig || fileBadType) && (
              <p className="mt-1 text-[11px] text-red-700">
                {fileTooBig
                  ? "File exceeds the 5 MB limit."
                  : "Only PNG, JPEG, GIF, or WebP images are accepted."}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="concept" className={labelClass}>
              Meme concept - our team designs it for you
            </label>
            <textarea
              id="concept"
              value={conceptText}
              onChange={(e) => setConceptText(e.target.value)}
              placeholder="Describe the idea: format, caption, reference…"
              maxLength={MAX_CONCEPT_LEN}
              rows={4}
              className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-soft outline-none focus:border-line-strong"
            />
            <p className="mt-1 text-right text-[11px] text-faint">
              {conceptText.length}/{MAX_CONCEPT_LEN}
            </p>
          </div>
        )}

        {/* Terms & Conditions agreement - gates submission */}
        <div className="rounded-md border border-line bg-surface p-3">
          <button
            type="button"
            onClick={() => setPolicyOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-accent "
          >
            Read the Terms and Conditions
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
              I have read and agree to the Meme Monks Terms and Conditions.
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
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
