import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { ArrowRight, CalendarDays, Trophy, Activity } from "lucide-react";
import { store, subscribeStore } from "@/lib/store";
import { PROGRAMME, allSessions } from "@/data/programme";
import { currentWeek, todaySession, nextSession, ukShortDate, today } from "@/lib/programmeUtils";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";
import { semStore, useSemStarted } from "@/lib/sem/store";
import { useSemProgress } from "@/lib/sem/progress";
import { validationCounts as semCounts } from "@/lib/sem/manifest";
import { useBtbStarted } from "@/lib/btb/store";
import { useBtbProgress } from "@/lib/btb/progress";
import { validationCounts as btbCounts } from "@/lib/btb/manifest";

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

function useStore<T>(read: () => T): T {
  return useSyncExternalStore(subscribeStore, read, read);
}

function MyProgrammesPage() {
  const logs = useStore(store.getLogs);
  const results = useStore(store.getResults);
  const { user, loading: authLoading } = useAuth();
  const { items: entitled } = useEntitlements(user?.id);
  const semStarted = useSemStarted();
  const semProg = useSemProgress(user?.id);
  const btbStarted = useBtbStarted();
  const btbProg = useBtbProgress(user?.id);
  const navigate = useNavigate();

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

  const owns = entitled.some((e) => e.slug === "athx-2026");
  const ownsSem = entitled.some((e) => e.slug === "sem-2026");
  const ownsBtb = entitled.some((e) => e.slug === "basic-training-blueprint-plus");

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.first_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    "";

  // Real ATHX data only — no invented metrics.
  const totalSessions = allSessions().length;
  const completedSessions = Object.values(logs).filter((l) => l.completed).length;
  const completionPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const week = currentWeek();
  const ts = todaySession();
  const next = nextSession();
  const todayISO = today().toISOString().slice(0, 10);

  // Recent activity, real entries only
  const recent = [
    ...Object.values(logs)
      .filter((l) => l.endedAt)
      .map((l) => ({
        ts: l.endedAt!,
        kind: "session",
        text: `Session completed`,
        sub: PROGRAMME.weeks
          .flatMap((w) => w.sessions)
          .find((s) => s.id === l.sessionId)?.title ?? l.sessionId,
      })),
    ...results.slice(-10).map((r) => ({
      ts: r.createdAt,
      kind: "result",
      text: `Logged ${r.exercise}`,
      sub: r.prescribed ?? r.kind,
    })),
  ]
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .slice(0, 5);

  return (
    <>
      {/* MASTHEAD — image first, text block below */}
      <section className="relative">
        <img
          src={heroAsset.url}
          alt=""
          aria-hidden
          className="block w-full h-auto bg-background select-none"
          draggable={false}
        />
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

        {/* stat strip — no boxes */}
        <div className="border-y border-border/60">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
            <StatStrip label="Active" value={String(entitled.length)} />
            <StatStrip label="Current week" value={String(week.number === 8 ? "RW" : week.number)} />
            <StatStrip label="Sessions completed" value={String(completedSessions)} />
            <StatStrip label="Results logged" value={String(results.length)} />
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20 grid lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,0.42fr)] gap-y-12 lg:gap-x-12 xl:gap-x-16">
        {/* LEFT — programmes lists */}
        <div className="space-y-14 lg:space-y-16 lg:pr-4 xl:pr-8">
          {/* ACTIVE */}
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="eyebrow">Active</p>
              </div>
            </div>

            {owns ? (
              <ActiveProgrammeCard
                completionPct={completionPct}
                weekLabel={`Week ${week.number === 8 ? "RW" : week.number} of ${PROGRAMME.weeks.length}`}
                nextLine={
                  ts
                    ? `Today · ${ts.title}`
                    : next?.date
                      ? `${ukShortDate(next.date)} · ${next.title}`
                      : "Programme complete"
                }
              />
            ) : (
              <Empty text="No active programmes" />
            )}

            {/* S.E.M. 2026 — Ready to start OR Active (when started) */}
            {ownsSem && semStarted.started && (
              <div className="mt-10">
                <SemActiveCard
                  coreCompleted={semProg.coreCompleted}
                  coreTotal={semCounts().core}
                  optionalCompleted={semProg.optionalCompleted}
                  optionalTotal={semCounts().optional}
                />
              </div>
            )}
          </div>

          {ownsBtb && btbStarted.started && (
            <div className="mt-10">
              <BtbActiveCard
                coreCompleted={btbProg.coreCompleted}
                coreTotal={btbCounts().core}
              />
            </div>
          )}

          {((ownsSem && !semStarted.started) || (ownsBtb && !btbStarted.started)) && (
            <div>
              <p className="eyebrow mb-4">Ready to start</p>
              <div className="space-y-10">
                {ownsSem && !semStarted.started && (
                  <SemReadyCard onStart={() => { semStore.markStarted(); navigate({ to: "/my-programmes/sem-2026/today" }); }} />
                )}
                {ownsBtb && !btbStarted.started && <BtbReadyCard />}
              </div>
            </div>
          )}

          {/* UPCOMING */}
          <div>
            <p className="eyebrow mb-4">Upcoming</p>
            <Empty text="No upcoming programmes" />
          </div>

          {/* COMPLETED */}
          <div>
            <p className="eyebrow mb-4">Completed</p>
            {completionPct === 100 ? (
              <div className="border-t border-border/60 pt-5">
                <p className="font-display text-bone text-xl tracking-[-0.02em]">ATHX 2026</p>
                <p className="text-foreground-muted text-xs mt-1">Completed</p>
              </div>
            ) : (
              <Empty text="No completed programmes yet" />
            )}
          </div>
        </div>

        {/* vertical divider — desktop only */}
        <div aria-hidden className="hidden lg:block w-px bg-border/60" />

        {/* RIGHT — sidebar */}
        <aside className="space-y-10 lg:pl-4 xl:pl-8">
          <SidebarCard title="Quick actions">
            <SideLink to="/programmes" label="Browse programmes" />
            <SideLink to="/my-programmes/athx-2026" label="View ATHX cover" />
            <SideLink to="/today" label="Continue training" />
          </SidebarCard>

          <SidebarCard title="Recent activity">
            {recent.length === 0 ? (
              <p className="text-foreground-muted text-xs">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Activity className="h-3.5 w-3.5 text-signal mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-bone text-xs">{r.text}</p>
                      <p className="text-foreground-muted text-[10px] truncate">{r.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SidebarCard>

          <SidebarCard title="Your progress">
            <p className="text-foreground-muted text-[10px] uppercase tracking-widest">All-time overview</p>
            <div className="mt-4 flex items-center gap-5">
              <ProgressRing pct={completionPct} />
              <div className="space-y-1.5 text-xs">
                <Row k="Sessions completed" v={String(completedSessions)} />
                <Row k="Results logged" v={String(results.length)} />
                <Row k="Programme weeks" v={String(PROGRAMME.weeks.length)} />
              </div>
            </div>
            <Link
              to="/progress"
              className="mt-5 inline-flex items-center gap-2 eyebrow text-signal"
            >
              View detailed progress <ArrowRight className="h-3 w-3" />
            </Link>
          </SidebarCard>
        </aside>
      </section>

      {/* DOWNLOADS — only shown if real files exist */}
      {/* No downloads exist on disk yet; section intentionally omitted per brief. */}

      {/* Hidden noindex sanity note (visually present, screen-reader hidden) */}
      <p className="sr-only">This area is private and excluded from search.</p>
    </>
  );
}

function ActiveProgrammeCard({
  completionPct,
  weekLabel,
  nextLine,
}: {
  completionPct: number;
  weekLabel: string;
  nextLine: string;
}) {
  return (
    <article className="border-t border-border/60 pt-8">
      <div className="flex flex-col">
        <p className="eyebrow text-foreground-muted">Compete · 01</p>
        <h3 className="font-display font-bold text-bone text-4xl lg:text-6xl tracking-[-0.025em] mt-2">
          ATHX 2026
        </h3>
        <p className="text-foreground-muted text-sm mt-3 max-w-[44ch]">
          Seven-week hybrid competition preparation.
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
          <li className="inline-flex items-center gap-2"><CalendarDays className="h-3 w-3" />{weekLabel}</li>
          <li className="inline-flex items-center gap-2"><Trophy className="h-3 w-3" />Race 23.08.2026</li>
        </ul>

        <div className="mt-8 max-w-md">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-foreground-muted mb-2">
            <span>Progress</span>
            <span className="text-bone tabular">{completionPct}%</span>
          </div>
          <div className="h-[2px] bg-surface-raised overflow-hidden">
            <div className="h-full bg-signal" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">Next session</p>
        <p className="text-bone text-base font-display mt-1">{nextLine}</p>

        <div className="mt-8 flex flex-wrap gap-6">
          <Link
            to="/today"
            className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors"
          >
            Continue training <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/my-programmes/athx-2026"
            className="inline-flex items-center gap-3 text-foreground-muted font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-border/60 hover:text-bone hover:border-bone transition-colors"
          >
            View cover
          </Link>
        </div>
      </div>
    </article>
  );
}

function StatStrip({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-6 px-1 first:pl-0 md:px-6 md:first:pl-0">
      <p className="eyebrow text-foreground-muted">{label}</p>
      <p className="font-display text-bone text-3xl md:text-4xl tracking-[-0.02em] tabular mt-3">{value}</p>
    </div>
  );
}

function SemReadyCard({ onStart }: { onStart: () => void }) {
  return (
    <article className="border-t border-border/60 pt-8">
      <p className="eyebrow text-foreground-muted">Compete · 02</p>
      <h3 className="font-display font-bold text-bone text-3xl lg:text-5xl tracking-[-0.025em] mt-2">S.E.M. 2026</h3>
      <p className="text-foreground-muted text-sm mt-3 max-w-[44ch]">Strength. Endurance. MetCon. — eight-week competition preparation.</p>
      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
        <li>Status · <span className="text-bone">Ready to start</span></li>
        <li>Format · <span className="text-bone">Individual / pairs</span></li>
      </ul>
      <div className="mt-8 flex flex-wrap gap-6">
        <button onClick={onStart} className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors">
          Start programme <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <Link to="/my-programmes/sem-2026" className="inline-flex items-center gap-3 text-foreground-muted font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-border/60 hover:text-bone hover:border-bone transition-colors">
          View cover
        </Link>
      </div>
    </article>
  );
}

function SemActiveCard({ coreCompleted, coreTotal, optionalCompleted, optionalTotal }: { coreCompleted: number; coreTotal: number; optionalCompleted: number; optionalTotal: number }) {
  const pct = Math.round((coreCompleted / Math.max(1, coreTotal)) * 100);
  return (
    <article className="border-t border-border/60 pt-8">
      <p className="eyebrow text-foreground-muted">Compete · 02</p>
      <h3 className="font-display font-bold text-bone text-3xl lg:text-5xl tracking-[-0.025em] mt-2">S.E.M. 2026</h3>
      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
        <li>Core <span className="text-bone tabular">{coreCompleted}/{coreTotal}</span></li>
        <li>Optional <span className="text-bone tabular">{optionalCompleted}/{optionalTotal}</span></li>
      </ul>
      <div className="mt-8 max-w-md">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-foreground-muted mb-2">
          <span>Progress (core)</span>
          <span className="text-bone tabular">{pct}%</span>
        </div>
        <div className="h-[2px] bg-surface-raised overflow-hidden">
          <div className="h-full bg-signal" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-6">
        <Link to="/my-programmes/sem-2026/today" className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors">
          Continue training <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link to="/my-programmes/sem-2026" className="inline-flex items-center gap-3 text-foreground-muted font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-border/60 hover:text-bone hover:border-bone transition-colors">
          View cover
        </Link>
      </div>
    </article>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border-t border-border/60 pt-5">
      <p className="text-foreground-muted text-xs uppercase tracking-[0.22em]">{text}</p>
    </div>
  );
}

function BtbReadyCard() {
  return (
    <article className="border-t border-border/60 pt-8">
      <p className="eyebrow text-foreground-muted">Foundation · 03</p>
      <h3 className="font-display font-bold text-bone text-3xl lg:text-5xl tracking-[-0.025em] mt-2">Basic Training Blueprint+</h3>
      <p className="text-foreground-muted text-sm mt-4 max-w-[52ch] leading-relaxed">
        Foundational hybrid training. Set your start date to unlock week 1.
      </p>
      <div className="mt-8 flex flex-wrap gap-6">
        <Link to="/my-programmes/basic-training-blueprint-plus" className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors">
          Open programme <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
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
        <circle
          cx="35"
          cy="35"
          r={r}
          stroke="var(--signal)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-bone font-display text-sm tabular">
        {pct}%
      </span>
    </div>
  );
}
