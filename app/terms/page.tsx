import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — Meme Monks",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight text-ink">Terms and Conditions</h1>
      <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted">
        <p>
          By accessing, browsing, or using Meme Monks (&quot;the Platform&quot;), you
          agree to be bound by the following legally binding Terms and Conditions.
        </p>
        <p className="font-medium text-ink">User Content, Adaptations &amp; IP Clearance (DMCA &amp; Liability Shield):</p>
        <p>
          Open-Source &amp; Derived Memes: Users are permitted to use open-source,
          public-domain, or widespread internet meme formats/templates (e.g., from
          Pinterest or Google Images). However, any custom edits, captions, or
          arrangements submitted remain the sole responsibility of the uploader.
        </p>
        <p>
          Indemnification: You represent that your submissions do not infringe on
          proprietary software, private personal property, or trademarked material
          outside fair-use internet humor. You agree to fully indemnify, defend, and
          hold harmless Meme Monks and its operators against any copyright claims,
          legal fees, or third-party liabilities arising from your content.
        </p>
        <p>
          License to Feature: By submitting a meme, you grant Meme Monks a
          non-exclusive, royalty-free, worldwide license to host, display, reformat,
          and feature your submission across the Platform.
        </p>
        <p className="font-medium text-ink">Application &amp; Evaluation Fees:</p>
        <p>
          Conditional Vetting Fee: Standard meme applications do not carry a
          mandatory fee. Meme Monks reserves the sole right to assess a nominal
          evaluation or curation fee (e.g., NPR 50.00 or an amount determined by
          the Platform) for special, high-tier, complex, or custom-category meme
          submissions.
        </p>
        <p>
          Email Notification &amp; Invoicing: If an application is designated for a
          special evaluation fee, payment instructions and invoice details will be
          sent directly to the applicant&apos;s provided email or Instagram.
        </p>
        <p>
          Non-Refundable Processing: Paid evaluation fees cover the administrative
          review of special applications and are strictly non-refundable. Payment
          of a fee does not guarantee approval or permanent placement on the main
          feed.
        </p>
        <p className="font-medium text-ink">Content Moderation &amp; Account Right of Removal:</p>
        <p>
          Zero Tolerance: You may not submit hate speech, illegal content,
          harassment, malware, or malicious scripts.
        </p>
        <p>
          Discretionary Removal: Meme Monks reserves the absolute right to reject,
          remove, or unpublish any meme, or suspend uploader privileges at any time
          without prior notice.
        </p>
        <p className="font-medium text-ink">Limitation of Liability:</p>
        <p>
          &quot;As-Is&quot; Service: The Platform is provided on an &quot;AS IS&quot; basis. Meme
          Monks is not liable for data loss, server downtime, or user interactions.
        </p>
      </div>
    </div>
  );
}
