import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, LineChart, BookOpen, User, Flame, Trophy, Calculator, LayoutGrid, X } from "lucide-react";
import { Wordmark } from "@/components/shell/Wordmark";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { hrpStore } from "@/lib/hrp/store";

const BASE = "/my-programmes/hybrid-race-plan";
const primary = [
  { to: `${BASE}/today`, label: "Today", icon: Flame },
  { to: `${BASE}/programme`, label: "Programme", icon: CalendarDays },
  { to: `${BASE}/progress`, label: "Progress", icon: LineChart },
  { to: `${BASE}/learn`, label: "Learn", icon: BookOpen },
  { to: `${BASE}/profile`, label: "Profile", icon: User },
];
const secondary = [
  { to: `${BASE}/event`, label: "Race day", icon: Trophy },
  { to: `${BASE}/calculator`, label: "Calculator", icon: Calculator },
  { to: "/my-programmes", label: "My library", icon: LayoutGrid },
];

export function HrpShell({ children, eyebrow, title }: { children: ReactNode; eyebrow?: string; title?: string }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, loading: authLoading } = useAuth();
  const { items, loading: entLoading } = useEntitlements(user?.id);

  useEffect(() => {
    hrpStore.configureUser(user?.id ?? null);
  }, [user?.id]);

  if (!authLoading && !user) return <GateSignIn />;
  if (!authLoading && !entLoading && !items.some((i) => i.slug === "hybrid-race-plan")) return <GateNoEntitlement />;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border bg-background sticky top-0 h-screen px-6 py-8">
        <div className="mb-12">
          <Wordmark size="lg" />
          <p className="eyebrow mt-3">HYBRID RACE PLAN</p>
        </div>
        <nav className="flex flex-col gap-1">
          {primary.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to} className={`group flex items-center gap-3 py-2.5 -mx-2 px-2 text-sm font-medium transition-colors ${active ? "text-bone" : "text-foreground-muted hover:text-bone"}`}>
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{it.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-signal" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 pt-6 border-t border-border">
          <p className="eyebrow mb-3">Tools</p>
          <nav className="flex flex-col gap-1">
            {secondary.map((it) => {
              const active = pathname === it.to;
              const Icon = it.icon;
              return (
                <Link key={it.to} to={it.to} className={`group flex items-center gap-3 py-2 text-sm transition-colors ${active ? "text-bone" : "text-foreground-muted hover:text-bone"}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto pt-6">
          <Link to="/my-programmes" className="text-[10px] uppercase tracking-widest text-foreground-muted hover:text-bone">← My programmes</Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-32 lg:pb-0 relative">
        <Link
          to="/my-programmes"
          data-exit-dashboard
          className="absolute top-4 right-4 lg:top-6 lg:right-6 z-30 inline-flex items-center gap-2 h-9 px-3 border border-border bg-background/80 backdrop-blur text-foreground-muted hover:text-bone hover:border-bone transition-colors text-[10px] uppercase tracking-widest font-display"
          aria-label="Exit to dashboard"
        >
          <X className="h-3.5 w-3.5" /> Exit
        </Link>
        {(eyebrow || title) && (
          <header className="border-b border-border px-5 lg:px-10 py-8 lg:py-10">
            {eyebrow && <p className="eyebrow text-signal">{eyebrow}</p>}
            {title && <h1 className="font-display font-bold text-bone tracking-tight uppercase text-3xl lg:text-5xl mt-2">{title}</h1>}
          </header>
        )}
        <div className="px-5 lg:px-10 py-8 lg:py-12">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-center gap-6 px-5 py-2 border-b border-border/60">
          {secondary.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${active ? "text-bone" : "text-foreground-muted"}`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
        <ul className="grid grid-cols-5">
          {primary.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <li key={it.to}>
                <Link to={it.to} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] uppercase tracking-widest ${active ? "text-bone" : "text-foreground-muted"}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  <span>{it.label}</span>
                  <span className={`h-0.5 w-6 ${active ? "bg-signal" : "bg-transparent"}`} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function GateSignIn() {
  return (
    <section className="min-h-[60vh] grid place-items-center px-5 py-20 bg-background">
      <div className="max-w-md text-center">
        <p className="eyebrow text-signal mb-3">Members only</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Sign in to access HYBRID RACE PLAN</h1>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/sign-in" className="h-11 px-6 inline-flex items-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">Sign in</Link>
          <Link to="/sign-up" className="h-11 px-6 inline-flex items-center border border-border text-bone text-xs uppercase tracking-widest font-display">Create account</Link>
        </div>
      </div>
    </section>
  );
}
function GateNoEntitlement() {
  return (
    <section className="min-h-[60vh] grid place-items-center px-5 py-20 bg-background">
      <div className="max-w-md text-center">
        <p className="eyebrow text-signal mb-3">No access</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">HYBRID RACE PLAN isn't in your library</h1>
        <p className="text-foreground-muted text-sm mt-4">Purchases are opening soon. Once enrolled, your programme will appear in your library.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/my-programmes" className="h-11 px-6 inline-flex items-center border border-border text-bone text-xs uppercase tracking-widest font-display">My programmes</Link>
          <Link to="/programmes/$slug" params={{ slug: "hybrid-race-plan" }} className="h-11 px-6 inline-flex items-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">View product</Link>
        </div>
      </div>
    </section>
  );
}