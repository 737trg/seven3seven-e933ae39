import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/** Bottom sheet on mobile, centred panel on desktop. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full md:max-w-lg max-h-[88dvh] overflow-y-auto bg-surface border-t md:border border-border md:rounded-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-surface px-5 py-4 border-b border-border/60">
          <h2 className="eyebrow">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="tap press text-foreground-muted hover:text-bone">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}