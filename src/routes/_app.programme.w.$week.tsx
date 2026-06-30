import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PROGRAMME } from "@/data/programme";
import { CategoryLabel, Tag } from "@/components/ui-prim/Tag";
import { ukShortDate } from "@/lib/programmeUtils";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/programme/w/$week")({
  component: WeekPage,
});

function WeekPage() {
  const { week } = useParams({ from: "/_app/programme/w/$week" });
  const w = PROGRAMME.weeks.find((x) => x.number === Number(week));
  if (!w) {
    return <div className="p-10 text-foreground-muted">Week not found.</div>;
  }
  return (
    <div className="max-w-[1080px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <Link to="/programme" className="eyebrow inline-flex items-center gap-1 hover:text-bone">
        ← Programme
      </Link>
      <header className="mt-6 mb-10 lg:mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">{w.dateRange}</p>
          <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
            {w.label}.
          </h1>
          <p className="text-bone mt-3 text-lg">{w.objective}</p>
          <p className="text-foreground-muted mt-2 text-sm max-w-xl">{w.checkpoint}</p>
        </div>
        <div className="flex gap-2">
          <Tag>{w.phase}</Tag>
          <Tag variant="outline">{w.load}</Tag>
        </div>
      </header>

      <div className="divide-y divide-border border-t border-b border-border">
        {w.sessions.map((s) => (
          <Link
            key={s.id}
            to="/programme/s/$sessionId"
            params={{ sessionId: s.id }}
            className="flex items-start gap-6 py-6 group hover:bg-surface/30 transition-colors px-2"
          >
            <div className="w-24 shrink-0">
              <p className="eyebrow">{s.day}</p>
              <p className="text-foreground-muted text-xs tabular mt-1">
                {s.date ? ukShortDate(s.date) : ""}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <CategoryLabel category={s.category} />
                <span className="text-[10px] uppercase tracking-widest text-foreground-muted">
                  {s.duration}
                </span>
              </div>
              <h2 className="font-display text-bone text-lg lg:text-xl leading-tight">
                {s.title}
              </h2>
              <p className="text-foreground-muted text-sm mt-1.5 line-clamp-2">
                {s.purpose}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-foreground-muted self-center opacity-0 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}