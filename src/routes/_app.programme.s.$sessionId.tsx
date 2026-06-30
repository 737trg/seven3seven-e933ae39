import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { getSessionById } from "@/data/programme";
import { CategoryLabel, Tag } from "@/components/ui-prim/Tag";
import { Flame, ArrowLeft, History } from "lucide-react";
import { store, subscribeStore } from "@/lib/store";
import { summariseResult } from "@/components/workout/logKind";
import { useState, useSyncExternalStore } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/programme/s/$sessionId")({
  component: SessionDetailPage,
});

function SessionDetailPage() {
  const { sessionId } = useParams({ from: "/_app/programme/s/$sessionId" });
  const s = getSessionById(sessionId);
  const [historyBlockId, setHistoryBlockId] = useState<string | null>(null);
  const results = useSyncExternalStore(
    subscribeStore,
    store.getResults,
    store.getResults,
  );
  if (!s) return <div className="p-10 text-foreground-muted">Session not found.</div>;

  const kindLabel: Record<string, string> = {
    warmup: "Warm-up",
    mainLift: "Main lift",
    assistance: "Assistance",
    conditioning: "Conditioning",
    cooldown: "Cool-down",
    log: "Log",
  };

  return (
    <div className="max-w-[920px] mx-auto px-5 lg:px-10 py-8 lg:py-14 pb-32 lg:pb-14">
      <Link
        to="/programme/w/$week"
        params={{ week: String(s.weekNumber) }}
        className="eyebrow inline-flex items-center gap-1 hover:text-bone"
      >
        <ArrowLeft className="h-3 w-3" /> Week {s.weekNumber === 8 ? "RW" : s.weekNumber}
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <CategoryLabel category={s.category} />
          <Tag variant="outline">{s.duration}</Tag>
          {s.completed && <Tag variant="accent">Complete</Tag>}
        </div>
        <p className="eyebrow mb-3">
          {s.day} · Week {s.weekNumber === 8 ? "RW" : s.weekNumber}
        </p>
        <h1 className="font-display font-bold text-bone text-3xl lg:text-5xl leading-[0.95] tracking-tight">
          {s.title}
        </h1>
        <p className="text-foreground-muted text-base mt-5 max-w-2xl leading-relaxed">
          {s.purpose}
        </p>
        <p className="text-[11px] uppercase tracking-widest text-bone mt-4">
          Expected effort — {s.expectedEffort}
        </p>
      </header>

      {/* Blocks */}
      <div className="space-y-10">
        {s.blocks.map((blk, i) => (
          <section key={blk.id} className="border-t border-border pt-6">
            <div className="flex items-baseline justify-between mb-4">
              <div className="flex items-baseline gap-4">
                <span className="font-display tabular text-bone text-2xl lg:text-3xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="eyebrow">{kindLabel[blk.kind] ?? blk.kind}</p>
                  <h3 className="font-display text-bone text-xl mt-0.5">{blk.title}</h3>
                </div>
              </div>
              {blk.timeWindow && (
                <span className="text-[10px] uppercase tracking-widest text-foreground-muted tabular">
                  {blk.timeWindow}
                </span>
              )}
            </div>
            <ul className="space-y-2.5 ml-12">
              {blk.lines.map((l, j) => (
                <li key={j} className="flex gap-3 text-sm text-bone/90 leading-relaxed">
                  <span className="text-signal mt-1.5 h-1 w-1 rounded-full shrink-0" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
            {blk.note && (
              <p className="mt-4 ml-12 text-xs text-foreground-muted italic">
                {blk.note}
              </p>
            )}
            {results.some((r) => r.sessionId === s.id && r.blockId === blk.id) && (
              <button
                onClick={() => setHistoryBlockId(blk.id)}
                className="ml-12 mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-foreground-muted hover:text-bone"
              >
                <History className="h-3 w-3" /> History
              </button>
            )}
          </section>
        ))}
      </div>

      {s.coachNote && (
        <section className="mt-12 border-l-2 border-signal pl-5">
          <p className="eyebrow mb-2">Coach note</p>
          <p className="text-bone text-base leading-relaxed">{s.coachNote}</p>
        </section>
      )}

      {/* Sticky CTA */}
      <div
        className="fixed bottom-0 lg:bottom-auto lg:relative inset-x-0 lg:inset-auto z-20 lg:z-auto bg-background/95 lg:bg-transparent backdrop-blur lg:backdrop-blur-0 border-t border-border lg:border-0 p-4 lg:p-0 lg:mt-12"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <div className="max-w-[920px] mx-auto flex gap-3">
          <Link
            to="/workout/$sessionId"
            params={{ sessionId: s.id }}
            className="flex-1 inline-flex items-center justify-center gap-2 h-14 px-7 text-sm font-display font-medium uppercase tracking-wide bg-signal text-bone hover:bg-signal/90 rounded-[4px]"
          >
            <Flame className="h-4 w-4" /> Start session
          </Link>
        </div>
      </div>

      <Sheet open={historyBlockId !== null} onOpenChange={(o) => !o && setHistoryBlockId(null)}>
        <SheetContent
          side="right"
          className="border-l border-border bg-background text-bone sm:max-w-md p-0 flex flex-col rounded-none"
        >
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="font-display text-bone text-xl">History</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {results
              .filter((r) => r.sessionId === s.id && r.blockId === historyBlockId)
              .slice()
              .reverse()
              .map((r) => (
                <div key={r.id} className="border-b border-border pb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
                      {r.dateISO} · W{r.weekNumber}
                    </span>
                    {r.rpe != null && (
                      <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
                        RPE {r.rpe}
                      </span>
                    )}
                  </div>
                  <p className="text-bone tabular text-base mt-1">
                    {summariseResult(r)}
                  </p>
                  {r.note && (
                    <p className="text-foreground-muted text-xs mt-1 italic">{r.note}</p>
                  )}
                </div>
              ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}