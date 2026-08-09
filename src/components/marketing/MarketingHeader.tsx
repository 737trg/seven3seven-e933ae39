import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Seven3SevenLogo } from "./Seven3SevenLogo";
import { useAuth } from "@/lib/useAuth";
import { useMembership } from "@/lib/useMembership";
import { cart, useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/programmes", label: "Programmes" },
  { to: "/pricing", label: "Pricing" },
  { to: "/apparel", label: "Apparel" },
  { to: "/about", label: "About" },
] as const;

export function MarketingHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const membership = useMembership(user?.id);
  const cartState = useCart();
  const count = cart.slugs(cartState).length;

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
          {!loading && user ? (
            <>
              <Link
                to="/my-programmes"
                className={`font-display uppercase text-[12px] tracking-[0.22em] transition-colors ${
                  pathname.startsWith("/my-programmes") ? "text-bone" : "text-foreground-muted hover:text-bone"
                }`}
              >
                <span className="relative inline-block py-1">My programmes</span>
              </Link>
              <Link
                to="/account"
                className={`font-display uppercase text-[12px] tracking-[0.22em] transition-colors ${
                  pathname.startsWith("/account") ? "text-bone" : "text-foreground-muted hover:text-bone"
                }`}
              >
                <span className="relative inline-block py-1">Account</span>
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                aria-label="Sign out"
                className="text-foreground-muted hover:text-bone"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="font-display uppercase text-[12px] tracking-[0.22em] text-foreground-muted hover:text-bone"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/cart"
            aria-label={count ? `Bag — ${count} item${count === 1 ? "" : "s"}` : "Bag"}
            className="relative text-foreground-muted hover:text-bone transition-colors"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-signal text-bone text-[10px] font-display leading-4 text-center tabular">
                {count}
              </span>
            )}
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <Link
            to={user ? "/my-programmes" : "/sign-in"}
            aria-label={user ? "My programmes" : "Sign in"}
            className="h-10 w-10 inline-flex items-center justify-center text-bone"
          >
            <User className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <Link
            to="/cart"
            aria-label={count ? `Bag — ${count} item${count === 1 ? "" : "s"}` : "Bag"}
            className="relative h-10 w-10 inline-flex items-center justify-center text-bone"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-signal text-bone text-[10px] font-display leading-4 text-center tabular">
                {count}
              </span>
            )}
          </Link>
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
            {membership.hasClubAccess ? (
              <Link
                to="/my-programmes"
                onClick={() => setOpen(false)}
                className="btn-signal press tap mb-4 w-full text-center"
              >
                Resume training
              </Link>
            ) : (
              <Link
                to="/pricing"
                onClick={() => setOpen(false)}
                className="btn-signal press tap mb-4 w-full text-center"
              >
                Join the Club — £14.99/mo
              </Link>
            )}
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
            {user ? (
              <>
                <Link to="/my-programmes" onClick={() => setOpen(false)} className="py-3 font-display uppercase text-sm tracking-[0.18em] text-bone border-b border-border">My programmes</Link>
                <Link to="/account" onClick={() => setOpen(false)} className="py-3 font-display uppercase text-sm tracking-[0.18em] text-bone border-b border-border">Account</Link>
                <button onClick={() => { setOpen(false); supabase.auth.signOut(); }} className="py-3 text-left font-display uppercase text-sm tracking-[0.18em] text-foreground-muted">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/sign-in" onClick={() => setOpen(false)} className="py-3 font-display uppercase text-sm tracking-[0.18em] text-bone border-b border-border">Sign in</Link>
                <Link to="/sign-up" onClick={() => setOpen(false)} className="py-3 font-display uppercase text-sm tracking-[0.18em] text-bone">Create account</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
