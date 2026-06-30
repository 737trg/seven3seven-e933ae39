import { createFileRoute, Link } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { ArrowRight, CalendarDays, Trophy, Activity, FileText } from "lucide-react";
import { store, subscribeStore } from "@/lib/store";
import { PROGRAMME, allSessions } from "@/data/programme";
import { currentWeek, todaySession, nextSession, ukShortDate, today } from "@/lib/programmeUtils";
import { developmentUser, getOwnedManifests, hasAccess } from "@/lib/devUser";

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
      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(216,41,50,0.14), transparent 55%), linear-gradient(180deg, #080808 0%, #0c0c0c 100%)",
          }}
        />
        <div className="relative max-w-[1280px] mx-auto px-5 lg:px-10 pt-14 pb-12 lg:pt-20 lg:pb-16">
          <p className="eyebrow mb-4 text-signal">Hello, {developmentUser.name}</p>
          <h1 className="font-display font-bold text-bone leading-[0.95] tracking-tight text-[clamp(2.25rem,6vw,4.5rem)]">
            MY PROGRAMMES
          </h1>
          <p className="text-foreground-muted text-sm md:text-base mt-4 max-w-[52ch]">
            Your training. Your progress. All in one place.
          </p>

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Active programmes" value={String(manifests.length)} />
            <Stat label="Current week" value={String(week.number === 8 ? "RW" : week.number)} />
            <Stat label="Sessions completed" value={String(completedSessions)} />
            <Stat label="Results logged" value={String(results.length)} />
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-5 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-3 gap-10">
        {/* LEFT — programmes lists */}
        <div className="lg:col-span-2 space-y-12">
          {/* ACTIVE */}
          <div>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="eyebrow">Active</p>
                <p className="text-foreground-muted text-xs mt-1">Continue where you left off.</p>
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
            <p className="eyebrow mb-3">Upcoming</p>
            <Empty text="No upcoming programmes" />
          </div>

          {/* COMPLETED */}
          <div>
            <p className="eyebrow mb-3">Completed</p>
            {completionPct === 100 ? (
              <div className="border border-border p-6 rounded-[2px]">
                <p className="font-display text-bone uppercase tracking-wider text-sm">ATHX 2026</p>
                <p className="text-foreground-muted text-xs mt-1">Completed.</p>
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
    <article className="border border-border bg-surface/30 rounded-[2px] overflow-hidden grid md:grid-cols-[1fr_1.2fr]">
      <div
        aria-hidden
        className="min-h-[180px] grain"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(216,41,50,0.15), transparent 55%), linear-gradient(135deg, #0b0b0b 0%, #181818 100%)",
        }}
      />
      <div className="p-6 lg:p-8 flex flex-col">
        <p className="eyebrow text-signal">Compete</p>
        <h3 className="font-display font-bold text-bone text-2xl lg:text-3xl tracking-tight mt-1">
          ATHX 2026
        </h3>
        <p className="text-foreground-muted text-xs mt-2">
          Seven-week hybrid competition preparation.
        </p>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[10px] uppercase tracking-widest text-foreground-muted">
          <li className="inline-flex items-center gap-1.5"><CalendarDays className="h-3 w-3" />{weekLabel}</li>
          <li className="inline-flex items-center gap-1.5"><Trophy className="h-3 w-3" />Race 23.08.2026</li>
        </ul>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-foreground-muted mb-2">
            <span>Progress</span>
            <span className="text-bone tabular">{completionPct}%</span>
          </div>
          <div className="h-[3px] bg-surface-raised rounded-full overflow-hidden">
            <div className="h-full bg-signal" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <p className="mt-5 text-[10px] uppercase tracking-widest text-foreground-muted">Next session</p>
        <p className="text-bone text-sm font-display mt-1">{nextLine}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/today"
            className="inline-flex items-center gap-2 h-11 px-5 bg-signal text-bone font-display uppercase text-[11px] tracking-[0.18em] hover:bg-signal/90 rounded-[2px]"
          >
            Continue programme <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/my-programmes/athx-2026"
            className="inline-flex items-center gap-2 h-11 px-5 border border-border text-bone font-display uppercase text-[11px] tracking-[0.18em] hover:border-bone rounded-[2px]"
          >
            View programme
          </Link>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4 rounded-[2px] bg-surface/30">
      <p className="eyebrow">{label}</p>
      <p className="font-display text-bone text-2xl tabular mt-2">{value}</p>
      <div className="mt-2 h-0.5 w-6 bg-signal" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-border p-6 rounded-[2px]">
      <p className="text-foreground-muted text-xs uppercase tracking-widest">{text}</p>
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border p-5 rounded-[2px] bg-surface/30">
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </div>
  );
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between py-2 text-bone text-xs hover:text-signal transition-colors border-b border-border last:border-0">
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
