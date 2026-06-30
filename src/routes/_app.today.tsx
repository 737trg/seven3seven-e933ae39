import { createFileRoute, Link } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import {
  currentWeek,
  daysUntilRace,
  todaySession,
  nextSession,
  ukShortDate,
  weeklyCompletion,
  today,
} from "@/lib/programmeUtils";
import { store, subscribeStore } from "@/lib/store";
import { Button } from "@/components/ui-prim/Button";
import { CategoryLabel, Tag } from "@/components/ui-prim/Tag";
import { ArrowRight, ChevronRight, Flame, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/today")({
  head: () => ({
    meta: [
      { title: "Today — 737 TRG" },
      { name: "description", content: "Today's session, readiness check and weekly progress." },
    ],
  }),
  component: TodayPage,
});

function useStore<T>(read: () => T): T {
  return useSyncExternalStore(
    subscribeStore,
    read,
    read,
  );
}

function TodayPage() {
  const athlete = useStore(store.getAthlete);
  const logs = useStore(store.getLogs);
  const week = currentWeek();
  const session = todaySession();
  const next = nextSession();
  const completion = weeklyCompletion(week, logs);
  const days = daysUntilRace();
  const todayDate = today();
  const readiness = useStore(() => store.getReadiness(todayDate.toISOString().slice(0, 10)));

  return (
    <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10 lg:mb-16">
        <div>
          <p className="eyebrow mb-3">ATHX 2026 · {week.label} · {week.phase}</p>
          <h1 className="font-display font-bold tracking-tight text-bone text-4xl lg:text-6xl leading-none">
            Today.
          </h1>
          <p className="text-foreground-muted mt-3 text-sm">
            Hello, {athlete.name}. {week.objective}.
          </p>
        </div>
        <div className="flex items-end gap-8">
          <Stat label="Days to race" value={String(days)} accent />
          <Stat label="Week" value={`${week.number === 8 ? "RW" : `0${week.number}`}`} />
          <Stat label="Done" value={`${completion.done}/${completion.total}`} />
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Today session */}
        <div className="lg:col-span-2">
          {session ? (
            <SessionHero
              session={session}
              isComplete={!!logs[session.id]?.completed}
              readiness={readiness}
            />
          ) : (
            <RestCard />
          )}

          <ReadinessRow />
        </div>

        {/* Side column */}
        <aside className="space-y-8">
          {/* Weekly progress */}
          <section>
            <h2 className="eyebrow mb-4">This week</h2>
            <div className="space-y-1.5">
              {week.sessions.map((s) => {
                const done = !!logs[s.id]?.completed;
                const isToday = session?.id === s.id;
                return (
                  <Link
                    key={s.id}
                    to="/programme/s/$sessionId"
                    params={{ sessionId: s.id }}
                    className={`flex items-center justify-between py-2.5 border-b border-border group ${
                      isToday ? "text-bone" : "text-foreground-muted hover:text-bone"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`tabular text-[10px] uppercase tracking-widest w-8 ${
                          isToday ? "text-signal" : ""
                        }`}
                      >
                        {s.day.slice(0, 3)}
                      </span>
                      <span className="text-sm">{s.title}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
                        {s.duration.replace(" min", "m")}
                      </span>
                      {done && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 h-[2px] w-full bg-surface-raised overflow-hidden">
              <div
                className="h-full bg-signal transition-all"
                style={{ width: `${completion.pct}%` }}
              />
            </div>
          </section>

          {/* Next */}
          {next && (
            <section>
              <h2 className="eyebrow mb-3">Next session</h2>
              <Link
                to="/programme/s/$sessionId"
                params={{ sessionId: next.id }}
                className="block border border-border p-5 hover:border-bone transition-colors"
              >
                <p className="text-xs uppercase tracking-widest text-foreground-muted mb-2">
                  {next.day} · {next.date ? ukShortDate(next.date) : ""}
                </p>
                <p className="font-display text-lg text-bone leading-tight">{next.title}</p>
                <p className="text-xs text-foreground-muted mt-2">{next.duration}</p>
              </Link>
            </section>
          )}

          {/* Key checkpoint */}
          <section>
            <h2 className="eyebrow mb-3">Key checkpoint</h2>
            <p className="text-sm text-foreground-muted leading-relaxed">
              {week.checkpoint}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p
        className={`font-display font-bold tabular text-3xl lg:text-4xl leading-none ${
          accent ? "text-signal" : "text-bone"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SessionHero({
  session,
  isComplete,
  readiness,
}: {
  session: ReturnType<typeof todaySession>;
  isComplete: boolean;
  readiness?: ReturnType<typeof store.getReadiness>;
}) {
  if (!session) return null;
  return (
    <article className="border border-border bg-surface relative grain overflow-hidden">
      <div className="p-6 lg:p-10">
        <div className="flex items-center gap-3 mb-6">
          <CategoryLabel category={session.category} />
          {isComplete && <Tag variant="accent">Complete</Tag>}
          <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-foreground-muted">
            <Clock className="h-3 w-3" /> {session.duration}
          </span>
        </div>
        <h2 className="font-display font-bold text-bone text-3xl lg:text-5xl leading-[0.95] tracking-tight">
          {session.title}
        </h2>
        <p className="text-foreground-muted mt-5 text-sm lg:text-base max-w-2xl leading-relaxed">
          {session.purpose}
        </p>

        <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-6">
          <MetaItem label="Purpose" value={session.expectedEffort} />
          <MetaItem label="Blocks" value={String(session.blocks.length)} />
          <MetaItem
            label="Readiness"
            value={readiness ? cap(readiness) : "—"}
          />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/workout/$sessionId"
            params={{ sessionId: session.id }}
            className="inline-flex items-center justify-center gap-2 h-14 px-7 text-sm font-display font-medium uppercase tracking-wide bg-signal text-bone hover:bg-signal/90 rounded-[4px]"
          >
            <Flame className="h-4 w-4" /> Start session
          </Link>
          <Link
            to="/programme/s/$sessionId"
            params={{ sessionId: session.id }}
            className="inline-flex items-center justify-center gap-2 h-14 px-7 text-sm font-display font-medium uppercase tracking-wide border border-bone/80 text-bone hover:bg-bone hover:text-obsidian rounded-[4px]"
          >
            View detail <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="text-sm text-bone leading-snug">{value}</p>
    </div>
  );
}

function RestCard() {
  return (
    <article className="border border-border p-10">
      <p className="eyebrow mb-4">Today</p>
      <h2 className="font-display text-bone text-4xl lg:text-5xl leading-none">
        Rest day.
      </h2>
      <p className="text-foreground-muted mt-4 max-w-md">
        Walk and move it if it helps. No hidden hero session.
      </p>
    </article>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function ReadinessRow() {
  const todayDate = today();
  const iso = todayDate.toISOString().slice(0, 10);
  const current = useStore(() => store.getReadiness(iso));
  const set = (level: "ready" | "average" | "heavy") => store.setReadiness(iso, level);
  const options: Array<{ level: "ready" | "average" | "heavy"; label: string; hint: string }> = [
    { level: "ready", label: "Ready", hint: "Follow as written" },
    { level: "average", label: "Average", hint: "Standard plan" },
    { level: "heavy", label: "Heavy", hint: "Keep main lift · drop one back-off · −20% conditioning" },
  ];
  return (
    <section className="mt-10 border border-border p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="eyebrow">How are you feeling?</h3>
        {current && (
          <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
            Logged
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const active = current === o.level;
          return (
            <button
              key={o.level}
              onClick={() => set(o.level)}
              className={`p-4 text-left border transition-colors ${
                active
                  ? "border-signal bg-signal/5 text-bone"
                  : "border-border text-foreground-muted hover:text-bone hover:border-bone"
              }`}
            >
              <p className="font-display text-base text-bone">{o.label}</p>
              <p className="text-[11px] mt-1 leading-snug">{o.hint}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}