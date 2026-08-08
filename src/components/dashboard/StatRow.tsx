/** Compact metric strip — four numbers that stay on one line on a phone. */
export function StatRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-4 divide-x divide-border/60 border-y border-border/60">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 px-3 py-4 first:pl-0 md:px-6 md:first:pl-0">
          <dt className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-foreground-muted leading-tight">
            {item.label}
          </dt>
          <dd className="font-display font-bold text-bone text-2xl md:text-4xl tracking-[-0.02em] tabular mt-2">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
