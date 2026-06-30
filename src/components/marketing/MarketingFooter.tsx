import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";
import { Seven3SevenLogo } from "./Seven3SevenLogo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background mt-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Brand row — wordmark scale */}
        <div className="pb-12 lg:pb-16 border-b border-border/60">
          <p className="font-display font-bold text-bone tracking-[-0.04em] leading-none text-[clamp(3rem,12vw,9rem)]">
            SEVEN3SEVEN
          </p>
        </div>

        <div className="pt-12 lg:pt-16 grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-8 lg:gap-x-10">
          {/* Brand statement */}
          <div className="col-span-2 md:col-span-4">
            <Seven3SevenLogo height={22} asLink={false} />
            <p className="text-foreground-muted text-sm mt-5 max-w-[32ch] leading-relaxed">
              Hybrid fitness and performance programmes. Built to be followed.
            </p>
            <div className="mt-6 flex items-center gap-4 text-foreground-muted">
              <span aria-label="Instagram — coming soon" title="Coming soon" className="opacity-50">
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span aria-label="YouTube — coming soon" title="Coming soon" className="opacity-50">
                <Youtube className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </div>
          </div>

          <FooterCol title="Programmes" className="col-span-1 md:col-span-2">
            <FooterLink to="/programmes">All programmes</FooterLink>
            <FooterLink to="/programmes">Compete</FooterLink>
            <FooterLink to="/programmes">Build</FooterLink>
            <FooterLink to="/programmes">Blueprint</FooterLink>
          </FooterCol>

          <FooterCol title="Brand" className="col-span-1 md:col-span-2">
            <FooterLink to="/apparel">Apparel</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/my-programmes">My programmes</FooterLink>
          </FooterCol>

          <FooterCol title="Support" className="col-span-1 md:col-span-2">
            <FooterLink to="/about">Contact</FooterLink>
            <span className="text-foreground-muted/60 text-xs">Terms</span>
            <span className="text-foreground-muted/60 text-xs">Privacy</span>
          </FooterCol>

          <FooterCol title="Train with purpose" className="col-span-2 md:col-span-2">
            <span className="text-bone text-xs">Drop 01 — in preparation</span>
            <span className="text-foreground-muted text-xs">First programmes — in development</span>
          </FooterCol>
        </div>

        <div className="mt-16 lg:mt-20 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between gap-3 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
          <span>© {new Date().getFullYear()} SEVEN3SEVEN. All rights reserved.</span>
          <span>Built for performance.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow mb-4">{title}</p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-bone text-xs hover:text-signal transition-colors w-fit"
    >
      {children}
    </Link>
  );
}
