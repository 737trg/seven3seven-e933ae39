import { Link } from "@tanstack/react-router";
import { Dumbbell, LineChart, HeartPulse, Trophy } from "lucide-react";

export type DashboardTab = "train" | "progress" | "body" | "club";

export const DASHBOARD_TABS: { key: DashboardTab; label: string; icon: typeof Dumbbell }[] = [
  { key: "train", label: "Train", icon: Dumbbell },
  { key: "progress", label: "Progress", icon: LineChart },
  { key: "body", label: "Body", icon: HeartPulse },
  { key: "club", label: "Club", icon: Trophy },
];

/** Desktop / tablet segmented control. */
export function DashboardSegments({ tab }: { tab: DashboardTab }) {
  return (
    <nav aria-label="Dashboard sections" className="hidden md:flex items-stretch border-y border-border/60">
      {DASHBOARD_TABS.map(({ key, label, icon: Icon }) => {
        const active = key === tab;
        return (
          <Link
            key={key}
            to="/my-programmes"
            search={{ tab: key }}
            className={`press flex-1 min-h-12 inline-flex items-center justify-center gap-2 font-display uppercase text-[11px] tracking-[0.22em] border-b-2 transition-colors ${
              active ? "text-bone border-signal" : "text-foreground-muted border-transparent hover:text-bone"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile bottom bar — thumb-reachable, safe-area padded. */
export function DashboardBottomNav({ tab }: { tab: DashboardTab }) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {DASHBOARD_TABS.map(({ key, label, icon: Icon }) => {
          const active = key === tab;
          return (
            <li key={key}>
              <Link
                to="/my-programmes"
                search={{ tab: key }}
                aria-current={active ? "page" : undefined}
                className={`press min-h-14 flex flex-col items-center justify-center gap-1 py-2 text-[10px] uppercase tracking-widest ${
                  active ? "text-bone" : "text-foreground-muted"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{label}</span>
                <span className={`h-0.5 w-6 ${active ? "bg-signal" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
