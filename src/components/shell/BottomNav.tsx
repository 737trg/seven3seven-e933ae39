import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, LineChart, BookOpen, User, Flame, Trophy, Calculator, LayoutGrid } from "lucide-react";

const items = [
  { to: "/today", label: "Today", icon: Flame },
  { to: "/programme", label: "Programme", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
];

const tools = [
  { to: "/race", label: "Race day", icon: Trophy },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/my-programmes", label: "My library", icon: LayoutGrid },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-center gap-6 px-5 py-2 border-b border-border/60">
        {tools.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`press min-h-11 flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${
                active ? "text-bone" : "text-foreground-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={`press min-h-14 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-widest ${
                  active ? "text-bone" : "text-foreground-muted"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{it.label}</span>
                <span
                  className={`h-0.5 w-6 ${active ? "bg-signal" : "bg-transparent"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}