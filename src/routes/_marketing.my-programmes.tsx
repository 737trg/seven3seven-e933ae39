import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Activity, CalendarDays, Trophy } from "lucide-react";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { useCustomerDashboard, type CustomerProgramme, type ActivityItem } from "@/lib/useCustomerDashboard";

export const Route = createFileRoute("/_marketing/my-programmes")({
  head: () => ({
    meta: [
      { title: "My programmes — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Your owned SEVEN3SEVEN programmes." },
    ],
  }),
  component: MyProgrammesPage,
});

function MyProgrammesPage() {
  const { user, loading: authLoading } = useAuth();
  const entitlements = useEntitlements(user?.id);
  const dashboard = useCustomerDashboard(user?.id, entitlements.items, entitlements.loading);

  if (!authLoading && !user) {
    return (
      <section className="min-h-[60vh] grid place-items-center px-5 py-20">
        <div className="max-w-md text-center">
          <p className="eyebrow text-signal mb-3">Members only</p>
          <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Sign in to access your programmes</h1>
          <p className="text-foreground-muted text-sm mt-4">Your library, progress and downloads live behind your account.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/sign-in" className="h-11 px-6 inline-flex items-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">Sign in</Link>
            <Link to="/sign-up" className="h-11 px-6 inline-flex items-center border border-border text-bone text-xs uppercase tracking-widest font-display">Create account</Link>
          </div>
        </div>
      </section>
    );
  }

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.first_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    "";

  const ready = dashboard.programmes.filter((p) => p.state === "ready");
  const active = dashboard.programmes.filter((p) => p.state === "active");
  const completed = dashboard.programmes.filter((p) => p.state === "completed");
  const progressPct = dashboard.programmes.length
    ? Math.round(
        dashboard.programmes.reduce((sum, programme) => sum + (programme.enrolment?.completion_pct ?? 0), 0) /
          dashboard.programmes.length,
      )
    : 0;

  return (
    <>
      <section className="relative">
        <img src={heroAsset.url} alt="" aria-hidden className="block w-full h-auto bg-background select-none" draggable={false} />
        <div className="bg-background">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 pt-14 md:pt-20 lg:pt-24 pb-12 md:pb-16 lg:pb-20">
            <p className="eyebrow text-foreground-muted mb-6 md:mb-8">
              {displayName || "Complete your profile"} — Library
            </p>
            <h1 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.9] text-[clamp(2.5rem,6.5vw,5rem)]">
              My programmes.
            </h1>
            <p className="text-bone/80 text-base md:text-lg mt-6 max-w-[52ch] leading-relaxed">
              Your training. Your progress. All in one place.
            </p>
          </div>
        </div>

        <div className="border-y border-border/60">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
            <StatStrip label="Active" value={dashboard.loading ? "—" : String(dashboard.activeCount)} />
            <StatStrip label="Current week" value={dashboard.loading ? "—" : dashboard.currentWeek ? String(dashboard.currentWeek) : "—"} />
            <StatStrip label="Sessions completed" value={dashboard.loading ? "—" : String(dashboard.sessionsCompleted)} />
            <StatStrip label="Results logged" value={dashboard.loading ? "—" : String(dashboard.resultsLogged)} />
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20 grid lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,0.42fr)] gap-y-12 lg:gap-x-12 xl:gap-x-16">
        <div className="space-y-14 lg:space-y-16 lg:pr-4 xl:pr-8">
          <ProgrammeGroup title="Active" empty="No active programmes" programmes={active} />
          <ProgrammeGroup title="Ready to start" empty="No programmes ready to start" programmes={ready} />
          <div>
            <p className="eyebrow mb-4">Upcoming</p>
            <Empty text="No upcoming programmes" />
          </div>
          <ProgrammeGroup title="Completed" empty="No completed programmes yet" programmes={completed} />
        </div>

        <div aria-hidden className="hidden lg:block w-px bg-border/60" />

        <aside className="space-y-10 lg:pl-4 xl:pl-8">
          <SidebarCard title="Quick actions">
            <QuickActions programmes={dashboard.programmes} />
          </SidebarCard>

          <SidebarCard title="Recent activity">
            <RecentActivity items={dashboard.recent} />
          </SidebarCard>

          <SidebarCard title="Your progress">
            <p className="text-foreground-muted text-[10px] uppercase tracking-widest">All-time overview</p>
            <div className="mt-4 flex items-center gap-5">
              <ProgressRing pct={progressPct} />
              <div className="space-y-1.5 text-xs">
                <Row k="Sessions completed" v={String(dashboard.sessionsCompleted)} />
                <Row k="Results logged" v={String(dashboard.resultsLogged)} />
                <Row k="Programmes owned" v={String(dashboard.programmes.length)} />
              </div>
            </div>
            {dashboard.programmes.length === 0 ? (
              <Link to="/programmes" className="mt-5 inline-flex items-center gap-2 eyebrow text-signal">
                Browse programmes <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <Link to="/my-programmes" className="mt-5 inline-flex items-center gap-2 eyebrow text-signal">
                View all programmes <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </SidebarCard>
        </aside>
      </section>

      <p className="sr-only">This area is private and excluded from search.</p>
    </>
  );
}

function ProgrammeGroup({ title, empty, programmes }: { title: string; empty: string; programmes: CustomerProgramme[] }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      {programmes.length === 0 ? (
        <Empty text={empty} />
      ) : (
        <div className="space-y-10">
          {programmes.map((programme, index) => (
            <ProgrammeCard key={programme.product_id} programme={programme} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgrammeCard({ programme, index }: { programme: CustomerProgramme; index: number }) {
  const pct = Math.round(programme.enrolment?.completion_pct ?? 0);
  const href = programmePath(programme, programme.state === "active" ? "continue" : "cover");
  const cta = programme.state === "ready" ? "Start programme" : programme.state === "completed" ? "View programme" : "Continue training";

  return (
    <article className="border-t border-border/60 pt-8">
      <div className="flex flex-col">
        <p className="eyebrow text-foreground-muted">{programme.collection} · {String(index).padStart(2, "0")}</p>
        <h3 className="font-display font-bold text-bone text-3xl lg:text-6xl tracking-[-0.025em] mt-2">
          {programme.name}
        </h3>
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
          <li className="inline-flex items-center gap-2"><CalendarDays className="h-3 w-3" />{programme.duration_weeks ? `${programme.duration_weeks} weeks` : "Programme"}</li>
          <li className="inline-flex items-center gap-2"><Trophy className="h-3 w-3" />{stateLabel(programme.state)}</li>
        </ul>
        {programme.enrolment && (
          <div className="mt-8 max-w-md">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-foreground-muted mb-2">
              <span>Progress</span>
              <span className="text-bone tabular">{pct}%</span>
            </div>
            <div className="h-[2px] bg-surface-raised overflow-hidden">
              <div className="h-full bg-signal" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-6">
          <Link to={href} className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors">
            {cta} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {programme.state === "active" && (
            <Link to={programmePath(programme, "cover")} className="inline-flex items-center gap-3 text-foreground-muted font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-border/60 hover:text-bone hover:border-bone transition-colors">
              View programme
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function QuickActions({ programmes }: { programmes: CustomerProgramme[] }) {
  if (programmes.length === 0) {
    return (
      <>
        <SideLink to="/programmes" label="Browse programmes" />
        <SideLink to="/account" label="My account" />
      </>
    );
  }

  const active = programmes.filter((p) => p.state === "active");
  const ready = programmes.filter((p) => p.state === "ready");
  const mostRecent = [...active].sort((a, b) => ((b.enrolment?.updated_at ?? "") < (a.enrolment?.updated_at ?? "") ? -1 : 1))[0];

  if (active.length > 1 && mostRecent) {
    return (
      <>
        <SideLink to={programmePath(mostRecent, "continue")} label={`Continue ${mostRecent.name}`} />
        <SideLink to="/my-programmes" label="View all programmes" />
        <SideLink to="/account" label="My account" />
      </>
    );
  }

  if (active.length === 1) {
    const programme = active[0];
    return (
      <>
        <SideLink to={programmePath(programme, "continue")} label={`Continue ${programme.name}`} />
        <SideLink to={programmePath(programme, "cover")} label="View programme" />
        <SideLink to="/account" label="My account" />
      </>
    );
  }

  const next = ready[0] ?? programmes[0];
  return (
    <>
      <SideLink to={programmePath(next, "cover")} label={`Start ${next.name}`} />
      <SideLink to={programmePath(next, "cover")} label={`View ${next.name} cover`} />
      <SideLink to="/account" label="My account" />
    </>
  );
}

function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return <p className="text-foreground-muted text-xs uppercase tracking-[0.2em]">No activity yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={`${item.ts}-${i}`} className="flex items-start gap-3">
          <Activity className="h-3.5 w-3.5 text-signal mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-bone text-xs">{item.title}</p>
            <p className="text-foreground-muted text-[10px] truncate">{item.sub}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function programmePath(programme: CustomerProgramme, intent: "cover" | "continue") {
  if (programme.slug === "athx-2026") return intent === "continue" ? "/today" : "/my-programmes/athx-2026";
  const base = programme.base_path || `/my-programmes/${programme.slug}`;
  return intent === "continue" ? `${base}/today` : base;
}

function stateLabel(state: CustomerProgramme["state"]) {
  if (state === "ready") return "Ready to start";
  if (state === "completed") return "Completed";
  return "Active";
}

function StatStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-6 px-1 first:pl-0 md:px-6 md:first:pl-0">
      <p className="eyebrow text-foreground-muted">{label}</p>
      <p className="font-display text-bone text-3xl md:text-4xl tracking-[-0.02em] tabular mt-3">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border-t border-border/60 pt-5">
      <p className="text-foreground-muted text-xs uppercase tracking-[0.22em]">{text}</p>
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-5 pb-4 border-b border-border/60">{title}</p>
      {children}
    </div>
  );
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between py-3 text-bone text-sm hover:text-signal transition-colors border-b border-border/60 last:border-0">
      <span>{label}</span>
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-foreground-muted">{k}</span>
      <span className="text-bone tabular">{v}</span>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <div className="relative h-[80px] w-[80px] shrink-0">
      <svg viewBox="0 0 70 70" className="h-full w-full -rotate-90">
        <circle cx="35" cy="35" r={r} stroke="var(--surface-raised)" strokeWidth="4" fill="none" />
        <circle cx="35" cy="35" r={r} stroke="var(--signal)" strokeWidth="4" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-bone font-display text-sm tabular">{pct}%</span>
    </div>
  );
}
