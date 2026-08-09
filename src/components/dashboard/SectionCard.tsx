import type { ReactNode } from "react";

/** One consistent surface for every dashboard panel. */
export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="hairline elevated p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-border/60">
        <h2 className="eyebrow">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
