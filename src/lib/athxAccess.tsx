import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { store } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";

export const ATHX_SLUG = "athx-2026";
export const ATHX_PRODUCT_PATH = "/my-programmes/athx-2026";

export function useAthxAccess() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading: entLoading } = useEntitlements(user?.id);
  const hasAccess = !!user && items.some((item) => item.slug === ATHX_SLUG && !!item.programme_version_id);
  const configKey = `${user?.id ?? "anonymous"}:${hasAccess ? "1" : "0"}:${authLoading || entLoading ? "loading" : "ready"}`;
  const [configuredKey, setConfiguredKey] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || entLoading) return;
    store.configureAthxAccess({ userId: user?.id ?? null, entitled: hasAccess });
    setConfiguredKey(configKey);
  }, [authLoading, entLoading, user?.id, hasAccess, configKey]);

  return useMemo(
    () => ({
      user,
      loading: authLoading || entLoading || configuredKey !== configKey,
      hasAccess,
      entitlements: items,
    }),
    [user, authLoading, entLoading, configuredKey, configKey, hasAccess, items],
  );
}

export function AthxAccessGate({ children }: { children: ReactNode }) {
  const { user, loading, hasAccess } = useAthxAccess();

  if (loading) return <PrivateAccessShell eyebrow="Checking access" title="Loading." />;
  if (!user) {
    return (
      <PrivateAccessShell eyebrow="Members only" title="Sign in to continue.">
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/sign-in" className="h-11 px-6 inline-flex items-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">Sign in</Link>
          <Link to="/my-programmes" className="h-11 px-6 inline-flex items-center border border-border text-bone text-xs uppercase tracking-widest font-display">My programmes</Link>
        </div>
      </PrivateAccessShell>
    );
  }
  if (!hasAccess) {
    return (
      <PrivateAccessShell eyebrow="No access" title="ATHX 2026 is private.">
        <p className="mt-4 text-foreground-muted text-sm max-w-sm mx-auto">
          This personalised programme is not in your library.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/my-programmes" className="h-11 px-6 inline-flex items-center border border-border text-bone text-xs uppercase tracking-widest font-display">My programmes</Link>
          <Link to="/programmes" className="h-11 px-6 inline-flex items-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">Browse programmes</Link>
        </div>
      </PrivateAccessShell>
    );
  }

  return <>{children}</>;
}

function PrivateAccessShell({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="min-h-screen grid place-items-center bg-background text-foreground px-5 py-20">
      <div className="max-w-lg text-center">
        <p className="eyebrow text-signal mb-3">{eyebrow}</p>
        <h1 className="font-display font-bold text-bone text-3xl lg:text-5xl tracking-tight uppercase">{title}</h1>
        {children}
      </div>
    </section>
  );
}
