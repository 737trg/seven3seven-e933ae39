import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  LineChart,
  BookOpen,
  User,
  Flame,
  Trophy,
  Calculator,
} from "lucide-react";
import { Wordmark } from "./Wordmark";

const items = [
  { to: "/today", label: "Today", icon: Flame },
  { to: "/programme", label: "Programme", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
];

const secondary = [
  { to: "/race", label: "Race day", icon: Trophy },
  { to: "/calculator", label: "Load calculator", icon: Calculator },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border bg-background sticky top-0 h-screen px-6 py-8">
      <div className="mb-12">
        <Wordmark size="lg" />
        <p className="eyebrow mt-3">Private programme</p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`group flex items-center gap-3 py-2.5 -mx-2 px-2 text-sm font-medium transition-colors ${
                active ? "text-bone" : "text-foreground-muted hover:text-bone"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span>{it.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-signal" />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10 pt-6 border-t border-border">
        <p className="eyebrow mb-3">Tools</p>
        <nav className="flex flex-col gap-1">
          {secondary.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`group flex items-center gap-3 py-2 text-sm transition-colors ${
                  active ? "text-bone" : "text-foreground-muted hover:text-bone"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto pt-6 text-[10px] uppercase tracking-widest text-foreground-muted">
        ATHX 2026
      </div>
    </aside>
  );
}