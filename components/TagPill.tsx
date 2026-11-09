export function TagPill({ tag }: { tag: string }) {
  return (
    <span className="border border-edge px-2 py-0.5 font-mono text-[11px] text-dim transition-colors hover:border-neon/50 hover:text-neon">
      #{tag}
    </span>
  );
}
