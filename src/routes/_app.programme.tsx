import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PROGRAMME } from "@/data/programme";
import { Tag } from "@/components/ui-prim/Tag";

export const Route = createFileRoute("/_app/programme")({
  head: () => ({
    meta: [
      { title: "Programme — SEVEN3SEVEN" },
      { name: "description", content: "Seven-week build plus race week. Phases, loads and daily sessions." },
    ],
  }),
  component: ProgrammePage,
});

function ProgrammePage() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // Only render index content when at /programme exactly. Child routes render their own.
  if (pathname !== "/programme") {
    return <Outlet />;
  }
  return (
    <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-8 lg:py-14">
      <header className="mb-10 lg:mb-14">
        <p className="eyebrow mb-3">Programme</p>
        <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl leading-none">
          {PROGRAMME.name}.
        </h1>
        <p className="text-foreground-muted mt-3 text-sm max-w-xl">
          Seven-week build plus race week. Strength, endurance and conditioning rotated by purpose.
        </p>
      </header>

      <div className="space-y-4">
        {PROGRAMME.weeks.map((w) => (
          <Link
            key={w.number}
            to="/programme/w/$week"
            params={{ week: String(w.number) }}
            className="block border border-border hover:border-bone transition-colors p-6 lg:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-baseline gap-6">
                <span className="font-display font-bold tabular text-4xl lg:text-5xl text-bone leading-none">
                  {w.number === 8 ? "RW" : String(w.number).padStart(2, "0")}
                </span>
                <div>
                  <p className="eyebrow mb-1.5">{w.dateRange}</p>
                  <h2 className="font-display text-bone text-xl lg:text-2xl leading-tight">
                    {w.objective}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag>{w.phase}</Tag>
                <Tag variant="outline">{w.load}</Tag>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {w.sessions.map((s) => (
                <div
                  key={s.id}
                  className="h-1.5 bg-surface-raised"
                  title={`${s.day}: ${s.title}`}
                />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}