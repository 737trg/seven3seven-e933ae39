import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Wraps a Club-only dashboard panel. One-off buyers see what it does and
 * where to unlock it; members and pre-Club customers see the real thing.
 */
export function ClubLock({
  unlocked,
  blurb,
  children,
}: {
  unlocked: boolean;
  blurb: string;
  children: ReactNode;
}) {
  if (unlocked) return <>{children}</>;
  return (
    <div className="space-y-3">
      <p className="body-sm flex items-start gap-2">
        <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-foreground-muted" />
        <span>{blurb}</span>
      </p>
      <Link to="/pricing" className="tap press inline-flex items-center eyebrow text-signal">
        Join the Club
      </Link>
    </div>
  );
}