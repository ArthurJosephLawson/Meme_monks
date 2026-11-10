import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line px-4 py-3 text-xs text-faint md:px-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <span>Meme Monks</span>
        <nav className="flex gap-3">
          <Link href="/terms" className="text-muted">Terms</Link>
          <Link href="/privacy" className="text-muted">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
