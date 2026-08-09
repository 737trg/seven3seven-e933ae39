import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { useCustomerDashboard, type CustomerProgramme } from "@/lib/useCustomerDashboard";
import { usePreferences } from "@/lib/usePreferences";
import { computeStreak } from "@/lib/streak";
import { nextSessionFor } from "@/lib/nextSession";
import { useMembership } from "@/lib/useMembership";
import { StatRow } from "@/components/dashboard/StatRow";
import {
  DashboardSegments,
  DashboardBottomNav,
  type DashboardTab,
} from "@/components/shell/DashboardNav";
import { TrainTab } from "@/components/dashboard/tabs/TrainTab";
import { ComebackCard } from "@/components/dashboard/ComebackCard";
import { InstallPrompt } from "@/components/shell/InstallPrompt";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ProgressTab } from "@/components/dashboard/tabs/ProgressTab";
import { BodyTab } from "@/components/dashboard/tabs/BodyTab";
import { FuelTab } from "@/components/dashboard/tabs/FuelTab";
import { ClubTab } from "@/components/dashboard/tabs/ClubTab";
import { recoverPendingPurchases } from "@/lib/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const TABS: DashboardTab[] = ["train", "progress", "body", "fuel", "club"];

export const Route = createFileRoute("/_marketing/my-programmes")({
  validateSearch: (search: Record<string, unknown>): { tab: DashboardTab } => {
    const raw = String(search.tab ?? "train") as DashboardTab;
    return { tab: TABS.includes(raw) ? raw : "train" };
  },
  head: () => ({
    meta: [
      { title: "Dashboard — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Your SEVEN3SEVEN training dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { tab } = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  const entitlements = useEntitlements(user?.id);
  const dashboard = useCustomerDashboard(user?.id, entitlements.items, entitlements.loading);
  const { prefs, update: updatePrefs, loading: prefsLoading } = usePreferences(user?.id);
  const membership = useMembership(user?.id);
  const club = membership.hasClubAccess;
  const streak = useMemo(
    () => computeStreak(dashboard.programmes.flatMap((p) => p.completions.map((c) => c.completed_at))),
    [dashboard.programmes],
  );

  /** Days since the most recent completed session, or null if never trained. */
  const daysSinceLast = useMemo(() => {
    const stamps = dashboard.programmes
      .flatMap((p) => p.completions.map((c) => c.completed_at))
      .filter(Boolean)
      .sort();
    const last = stamps[stamps.length - 1];
    if (!last) return null;
    return Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000);
  }, [dashboard.programmes]);

  const recoveryRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    if (recoveryRef.current === user.id) return;
    recoveryRef.current = user.id;
    // Safety net: any complete Stripe session missing an entitlement (webhook
    // drop, voucher redemption, closed tab) is fulfilled on dashboard open.
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
          <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Sign in to reach your dashboard</h1>
          <p className="text-foreground-muted text-sm mt-4">Your training, progress and downloads live behind your account.</p>
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
  const focus =
    dashboard.programmes.find((p) => p.product_id === prefs.primary_product_id) ??
    [...active].sort((a, b) =>
      (b.enrolment?.updated_at ?? "").localeCompare(a.enrolment?.updated_at ?? ""),
    )[0] ??
    ready[0];
  const focusNext = nextSessionFor(focus);
  const others = [...active, ...ready].filter((p) => p.product_id !== focus?.product_id);
  const setPrimary = (programme: CustomerProgramme) => {
    void updatePrefs({
      primary_product_id:
        prefs.primary_product_id === programme.product_id ? null : programme.product_id,
    });
  };
  const progressPct = dashboard.programmes.length
    ? Math.round(
        dashboard.programmes.reduce((sum, p) => sum + (p.enrolment?.completion_pct ?? 0), 0) /
          dashboard.programmes.length,
      )
    : 0;

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <section className="border-b border-border/60">
        <div className="max-w-[1200px] mx-auto container-x pt-7 md:pt-12 pb-5 md:pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <p className="eyebrow text-foreground-muted">{today}</p>
            {club && (
              <span className="inline-flex items-center gap-1.5 border border-signal/50 px-2 py-1 text-signal font-display uppercase text-[9px] tracking-[0.22em]">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.75} /> Club
              </span>
            )}
          </div>
          <h1 className="display-lg text-bone break-words">
            {displayName ? `Welcome back, ${displayName}.` : "Welcome back."}
          </h1>
          <p className="lede mt-3 max-w-[46ch]">
            {focusNext
              ? `Next up: ${focusNext.title}.`
              : "Pick a programme and your next session lands here."}
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto container-x py-5 md:py-6">
        <StatRow
          loading={dashboard.loading}
          items={[
            { label: "Active", value: String(dashboard.activeCount) },
            { label: "Week", value: dashboard.currentWeek ? String(dashboard.currentWeek) : "—" },
            { label: "Sessions", value: String(dashboard.sessionsCompleted) },
            { label: "Streak", value: String(streak.current) },
          ]}
        />
      </div>

      <div className="max-w-[1200px] mx-auto container-x">
        <DashboardSegments tab={tab} />
      </div>

      <main className="max-w-[1200px] mx-auto container-x pt-6 pb-28 md:pb-20">
        {tab === "train" && (
          <TrainTab
            loading={dashboard.loading}
            focus={focus}
            focusNext={focusNext}
            others={others}
            completed={completed}
            primaryId={prefs.primary_product_id}
            onPin={setPrimary}
            streak={streak}
            recent={dashboard.recent}
            programmePath={programmePath}
            stateLabel={stateLabel}
          />
        )}
        {tab === "progress" && (
          <ProgressTab
            userId={user?.id}
            units={prefs.units}
            club={club}
            totals={{
              sessions: dashboard.sessionsCompleted,
              results: dashboard.resultsLogged,
              programmes: dashboard.programmes.length,
              pct: progressPct,
            }}
          />
        )}
        {tab === "body" && <BodyTab userId={user?.id} units={prefs.units} club={club} />}
        {tab === "fuel" && <FuelTab userId={user?.id} units={prefs.units} club={club} />}
        {tab === "club" && <ClubTab userId={user?.id} membership={membership} />}
      </main>

      <DashboardBottomNav tab={tab} />
      <p className="sr-only">This area is private and excluded from search.</p>
    </>
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
