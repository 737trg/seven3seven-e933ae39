import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Activity } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { useCustomerDashboard, type CustomerProgramme, type ActivityItem } from "@/lib/useCustomerDashboard";
import { usePreferences } from "@/lib/usePreferences";
import { computeStreak } from "@/lib/streak";
import { nextSessionFor } from "@/lib/nextSession";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { PersonalRecordsPanel } from "@/components/dashboard/PersonalRecordsPanel";
import { StatRow } from "@/components/dashboard/StatRow";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { ProgrammeListCard } from "@/components/dashboard/ProgrammeListCard";
import { recoverPendingPurchases } from "@/lib/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";

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
  const { prefs, update: updatePrefs } = usePreferences(user?.id);
  const streak = useMemo(
    () => computeStreak(dashboard.programmes.flatMap((p) => p.completions.map((c) => c.completed_at))),
    [dashboard.programmes],
  );
  const recoveryRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    if (recoveryRef.current === user.id) return;
    recoveryRef.current = user.id;
    // Safety net: any complete Stripe session missing an entitlement (webhook
    // drop, voucher redemption, closed tab) is fulfilled on library open.
    recoverPendingPurchases({ data: { environment: getStripeEnvironment() } })
      .then((res) => {
        if (res.ok && res.fulfilled.length > 0) entitlements.refresh?.();
      })
      .catch(() => { /* non-blocking */ });
  }, [user?.id, entitlements]);

  if (!authLoading && !user) {
    return (
      <section className="min-h-[60vh] grid place-items-center px-5 py-20">
        <div className="max-w-md text-center">
          <p className="eyebrow text-signal mb-3">Members only</p>
          <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Sign in to access your programmes</h1>
          <p className="text-foreground-muted text-sm mt-4">Your library, progress and downloads live behind your account.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/sign-in" className="h-12 px-6 inline-flex items-center justify-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">Sign in</Link>
            <Link to="/sign-up" className="h-12 px-6 inline-flex items-center justify-center border border-border text-bone text-xs uppercase tracking-widest font-display">Create account</Link>
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
  // The athlete's highlighted programme: their explicit pick, otherwise the
  // most recently trained active programme, otherwise the first ready one.
  const focus =
    dashboard.programmes.find((p) => p.product_id === prefs.primary_product_id) ??
    [...active].sort((a, b) =>
      (b.enrolment?.updated_at ?? "").localeCompare(a.enrolment?.updated_at ?? ""),
    )[0] ??
    ready[0];
  const focusNext = nextSessionFor(focus);
  const setPrimary = (programme: CustomerProgramme) => {
    void updatePrefs({
      primary_product_id:
        prefs.primary_product_id === programme.product_id ? null : programme.product_id,
    });
  };
  const progressPct = dashboard.programmes.length
    ? Math.round(
        dashboard.programmes.reduce((sum, programme) => sum + (programme.enrolment?.completion_pct ?? 0), 0) /
          dashboard.programmes.length,
      )
    : 0;

  const others = [...active, ...ready].filter((p) => p.product_id !== focus?.product_id);

  return (
    <>
      {/* Header: text-first on mobile, editorial image only from lg up. */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-12 pt-8 md:pt-14 lg:pt-16 pb-6 md:pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <p className="eyebrow text-foreground-muted mb-3">
              {displayName ? `${displayName} — Library` : "Your library"}
            </p>
            <h1 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,9vw,4.5rem)]">
              My programmes.
            </h1>
            <p className="text-bone/70 text-sm md:text-base mt-3 max-w-[46ch]">
              Your training. Your progress. All in one place.
            </p>
          </div>
          <img
            src={heroAsset.url}
            alt=""
            aria-hidden
            loading="lazy"
            className="hidden lg:block w-[360px] xl:w-[440px] h-[200px] xl:h-[240px] object-cover object-center select-none"
            draggable={false}
          />
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-12">
        <div className="py-6 md:py-8">
          <StatRow
            items={[
              { label: "Active", value: dashboard.loading ? "—" : String(dashboard.activeCount) },
              { label: "Week", value: dashboard.loading ? "—" : dashboard.currentWeek ? String(dashboard.currentWeek) : "—" },
              { label: "Sessions", value: dashboard.loading ? "—" : String(dashboard.sessionsCompleted) },
              { label: "Streak", value: dashboard.loading ? "—" : String(streak.current) },
            ]}
          />
        </div>
      </div>

      <section className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-12 pb-16 lg:pb-20 grid lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,0.42fr)] gap-y-10 lg:gap-x-12 xl:gap-x-16">
        <div className="space-y-10 lg:pr-4 xl:pr-8">
          {focus && (
            <NextSessionCard
              programme={focus}
              next={focusNext}
              overviewHref={programmePath(focus, "cover")}
            />
          )}

          {dashboard.programmes.length === 0 && !dashboard.loading && (
            <div className="border border-border/60 p-6 text-center">
              <p className="text-bone text-sm">You don’t own any programmes yet.</p>
              <Link to="/programmes" className="mt-4 inline-flex items-center gap-2 eyebrow text-signal">
                Browse programmes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {others.length > 0 && (
            <ProgrammeGroup title="Your programmes" programmes={others} primaryId={prefs.primary_product_id} onPin={setPrimary} />
          )}

          {completed.length > 0 && (
            <ProgrammeGroup title="Completed" programmes={completed} primaryId={prefs.primary_product_id} onPin={setPrimary} />
          )}
        </div>

        <div aria-hidden className="hidden lg:block w-px bg-border/60" />

        <aside className="space-y-10 lg:pl-4 xl:pl-8">
          <SidebarCard title="Consistency">
            <StreakCard streak={streak} />
          </SidebarCard>

          <SidebarCard title="Personal records">
            <PersonalRecordsPanel userId={user?.id} defaultUnit={prefs.units} />
          </SidebarCard>

          <SidebarCard title="Recent activity">
            <RecentActivity items={dashboard.recent} />
          </SidebarCard>

          <SidebarCard title="Your progress">
            <div className="flex items-center gap-5">
              <ProgressRing pct={progressPct} />
              <div className="space-y-1.5 text-xs min-w-0 flex-1">
                <Row k="Sessions completed" v={String(dashboard.sessionsCompleted)} />
                <Row k="Results logged" v={String(dashboard.resultsLogged)} />
                <Row k="Programmes owned" v={String(dashboard.programmes.length)} />
              </div>
            </div>
          </SidebarCard>

          <SidebarCard title="Quick actions">
            <SideLink to="/programmes" label="Browse programmes" />
            <SideLink to="/account" label="My account" />
          </SidebarCard>
        </aside>
      </section>

      <p className="sr-only">This area is private and excluded from search.</p>
    </>
  );
}

function ProgrammeGroup({
  title,
  programmes,
  primaryId,
  onPin,
}: {
  title: string;
  programmes: CustomerProgramme[];
  primaryId: string | null;
  onPin: (p: CustomerProgramme) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <div className="space-y-4">
        {programmes.map((programme) => (
          <ProgrammeListCard
            key={programme.product_id}
            programme={programme}
            href={programmePath(programme, programme.state === "active" ? "continue" : "cover")}
            cta={programme.state === "ready" ? "Start programme" : programme.state === "completed" ? "View programme" : "Continue training"}
            stateLabel={stateLabel(programme.state)}
            isPrimary={primaryId === programme.product_id}
            onPin={onPin}
          />
        ))}
      </div>
    </div>
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
    <Link to={to} className="flex items-center justify-between py-4 text-bone text-sm hover:text-signal transition-colors border-b border-border/60 last:border-0">
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
