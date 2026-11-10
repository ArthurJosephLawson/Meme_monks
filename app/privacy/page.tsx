import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Meme Monks",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted">
        <p>
          Meme Monks collects only the information you provide when applying to
          upload (name, email or Instagram handle, submission content). This data
          is used to review applications and contact you about your submission.
        </p>
        <p>
          Uploaded meme files and application records are stored privately and are
          not shared publicly without approval. We do not sell or share your
          personal data with third parties.
        </p>
        <p>
          The site uses a theme preference stored in your browser (localStorage)
          and no tracking cookies. You may contact the operators to request
          deletion of your application data.
        </p>
      </div>
    </div>
  );
}
