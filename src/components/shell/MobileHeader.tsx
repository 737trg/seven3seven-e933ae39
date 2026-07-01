import { Wordmark } from "./Wordmark";
import { useRouterState } from "@tanstack/react-router";

export function MobileHeader({ title }: { title?: string }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  if (pathname === "/") return null;
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-5 h-12">
        <Wordmark size="sm" />
        {title && (
          <span className="eyebrow">{title}</span>
        )}
        <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
          Private
        </span>
      </div>
    </header>
  );
}