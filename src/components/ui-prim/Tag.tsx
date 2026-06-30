import type { ReactNode } from "react";

export function Tag({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "accent" | "outline";
}) {
  const base =
    "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest";
  const styles = {
    default: "bg-surface-raised text-foreground-muted",
    accent: "bg-signal text-bone",
    outline: "border border-border text-foreground-muted",
  }[variant];
  return <span className={`${base} ${styles}`}>{children}</span>;
}

export function CategoryLabel({ category }: { category: string }) {
  const map: Record<string, string> = {
    strength: "Strength",
    endurance: "Endurance",
    mixed: "Mixed",
    olympic: "Olympic",
    zone2: "Zone 2",
    recovery: "Recovery",
    rehearsal: "Rehearsal",
  };
  return <Tag variant="outline">{map[category] ?? category}</Tag>;
}