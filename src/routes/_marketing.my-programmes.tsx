import { createFileRoute, Link } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { ArrowRight, CalendarDays, Trophy, Activity, FileText } from "lucide-react";
import { store, subscribeStore } from "@/lib/store";
import { PROGRAMME, allSessions } from "@/data/programme";
import { currentWeek, todaySession, nextSession, ukShortDate, today } from "@/lib/programmeUtils";
import { developmentUser, getOwnedManifests, hasAccess } from "@/lib/devUser";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";

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
  const manifests = getOwnedManifests();
  const owns = hasAccess("athx-2026");

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
      {/* MASTHEAD — cinematic strip */}
      <section className="relative">
        <div className="relative w-full h-[44svh] min-h-[300px] max-h-[520px] overflow-hidden">
          <img
            src={heroAsset.url}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-[40%_28%]"
          />
          <div aria-hidden className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(8,8,8,0.45) 0%, rgba(8,8,8,0.55) 60%, rgba(8,8,8,0.98) 100%)"}} />
          <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col justify-end pb-10 lg:pb-14">
            <p className="eyebrow text-bone/70 mb-4">{developmentUser.name} — Library</p>
            <h1 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.92] text-[clamp(2.5rem,7vw,5.5rem)]">
              My programmes.
            </h1>
          </div>
        </div>

        {/* stat strip — no boxes */}
        <div className="border-y border-border/60">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
            <StatStrip label="Active" value={String(manifests.length)} />
            <StatStrip label="Current week" value={String(week.number === 8 ? "RW" : week.number)} />
            <StatStrip label="Sessions completed" value={String(completedSessions)} />
            <StatStrip label="Results logged" value={String(results.length)} />
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20 grid lg:grid-cols-3 gap-12 lg:gap-16">
        {/* LEFT — programmes lists */}
        <div className="lg:col-span-2 space-y-12">
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
          </div>

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

        {/* RIGHT — sidebar */}
        <aside className="space-y-8">
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
