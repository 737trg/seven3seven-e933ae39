import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { getSessionById } from "@/data/programme";
import { store } from "@/lib/store";
import { formatClock } from "@/lib/programmeUtils";
import { useState } from "react";

export const Route = createFileRoute("/workout/$sessionId/done")({
  component: DonePage,
});

function DonePage() {
  const { sessionId } = useParams({ from: "/workout/$sessionId/done" });
  const s = getSessionById(sessionId);
  const log = store.getLog(sessionId);
  const [reflection, setReflection] = useState(log?.reflection ?? "");
  const [rpe, setRpe] = useState<number>(log?.sessionRpe ?? 7);

  if (!s) return null;

  const save = () => {
    if (!log) return;
    store.saveLog({ ...log, sessionRpe: rpe, reflection });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-[560px] w-full">
        <p className="eyebrow mb-3">Session complete</p>
        <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
          Done.
        </h1>
        <p className="text-foreground-muted mt-3">{s.title}</p>

        <div className="grid grid-cols-2 gap-6 mt-10 border-y border-border py-6">
          <div>
            <p className="eyebrow mb-1">Duration</p>
            <p className="font-display tabular text-bone text-2xl">
              {log ? formatClock(log.durationSec ?? 0) : "—"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Blocks complete</p>
            <p className="font-display tabular text-bone text-2xl">
              {log ? log.blocks.filter((b) => b.completed).length : 0}/{s.blocks.length}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="eyebrow mb-3">Session RPE</p>
          <div className="flex gap-1.5">
            {[5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setRpe(n)}
                className={`flex-1 h-12 border tabular font-display ${
                  rpe === n ? "border-signal bg-signal/10 text-bone" : "border-border text-foreground-muted hover:text-bone"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="eyebrow mb-3">What should you remember from today?</p>
          <textarea
            rows={3}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="One sentence."
            className="w-full bg-transparent border-b border-border focus:border-bone outline-none py-2 text-bone placeholder:text-foreground-muted text-sm resize-none"
          />
        </div>

        <div className="mt-10 flex gap-3">
          <button
            onClick={save}
            className="flex-1 h-12 bg-bone text-obsidian font-display text-xs uppercase tracking-wide"
          >
            Save reflection
          </button>
          <Link
            to="/today"
            className="flex-1 h-12 border border-bone/80 text-bone font-display text-xs uppercase tracking-wide inline-flex items-center justify-center"
          >
            Today
          </Link>
        </div>
      </div>
    </div>
  );
}