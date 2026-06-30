import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X, User } from "lucide-react";
import { useState } from "react";
import { Seven3SevenLogo } from "./Seven3SevenLogo";

const NAV = [
  { to: "/programmes", label: "Programmes" },
  { to: "/apparel", label: "Apparel" },
  { to: "/about", label: "About" },
] as const;

export function MarketingHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/50">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-16 lg:h-20 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="lg:justify-self-start">
          <Seven3SevenLogo height={26} />
        </div>

        <nav className="hidden lg:flex items-center gap-10 lg:justify-self-center" aria-label="Primary">
          {NAV.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`font-display uppercase text-[12px] tracking-[0.22em] transition-colors ${
                  active ? "text-bone" : "text-foreground-muted hover:text-bone"
                }`}
              >
                <span className="relative inline-block py-1">
                  {n.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-signal" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-6 lg:justify-self-end">
          <Link
            to="/my-programmes"
            className={`font-display uppercase text-[12px] tracking-[0.22em] transition-colors ${
              pathname.startsWith("/my-programmes") ? "text-bone" : "text-foreground-muted hover:text-bone"
            }`}
          >
            <span className="relative inline-block py-1">
              My programmes
              {pathname.startsWith("/my-programmes") && (
                <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-signal" />
              )}
            </span>
          </Link>
          <button
            type="button"
            aria-label="Bag (no products available yet)"
            disabled
            className="text-foreground-muted/60 cursor-not-allowed"
            title="No products available yet"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <Link
            to="/my-programmes"
            aria-label="My programmes"
            className="h-10 w-10 inline-flex items-center justify-center text-bone"
          >
            <User className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            aria-label="Bag"
            disabled
            className="h-10 w-10 inline-flex items-center justify-center text-foreground-muted/60"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="h-10 w-10 inline-flex items-center justify-center text-bone"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="px-5 py-4 flex flex-col" aria-label="Mobile">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 font-display uppercase text-sm tracking-[0.18em] text-bone border-b border-border"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/my-programmes"
              onClick={() => setOpen(false)}
              className="py-3 font-display uppercase text-sm tracking-[0.18em] text-bone"
            >
              My programmes
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
