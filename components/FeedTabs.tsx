export type FeedTab = "foryou" | "new";

const TABS: { id: FeedTab; label: string }[] = [
  { id: "foryou", label: "For You" },
  { id: "new", label: "Newest" },
];

export function FeedTabs({
  tab,
  onChange,
}: {
  tab: FeedTab;
  onChange: (t: FeedTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Feed selection"
      className="inline-flex rounded-md border border-line bg-inset p-0.5"
    >
      {TABS.map(({ id, label }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`rounded-[5px] px-4 py-1.5 text-sm ${
              active
                ? "border border-line bg-surface font-medium text-ink"
                : "border border-transparent text-muted "
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
