import { Download } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useOwnedOutright } from "@/lib/useOwnedOutright";

/**
 * Renders the permanent PDF link only for athletes who bought the programme
 * outright. Club members train in the app; the PDF stays with one-off buyers.
 */
export function PdfDownloadLink({
  slug,
  href,
  label,
  className,
}: {
  slug: string;
  href: string;
  label: string;
  className?: string;
}) {
  const { user } = useAuth();
  const { loading, owned } = useOwnedOutright(user?.id, slug);

  if (loading) return null;
  if (!owned) {
    return (
      <p className="text-foreground-muted text-[10px] uppercase tracking-[0.22em] self-center">
        PDF included with one-off purchase
      </p>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? "h-11 px-6 inline-flex items-center gap-2 border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display hover:border-bone"}
    >
      <Download className="h-4 w-4" /> {label}
    </a>
  );
}