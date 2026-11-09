export function TagPill({ tag }: { tag: string }) {
  return (
    <span className="rounded bg-inset px-1.5 py-0.5 text-[11px] text-muted">
      {tag}
    </span>
  );
}
