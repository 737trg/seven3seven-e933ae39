import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";
import { Seven3SevenLogo } from "./Seven3SevenLogo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background mt-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-5">
            <Seven3SevenLogo height={24} />
            <p className="text-foreground-muted text-sm mt-6 max-w-[34ch] leading-relaxed">
              Hybrid fitness and performance programmes. Built to be followed.
            </p>
            <div className="mt-8 flex items-center gap-4 text-foreground-muted">
              <span aria-label="Instagram (coming soon)" title="Coming soon">
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span aria-label="YouTube (coming soon)" title="Coming soon">
                <Youtube className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </div>
          </div>

          <FooterCol title="Programmes">
            <FooterLink to="/programmes">All programmes</FooterLink>
            <FooterLink to="/programmes">Compete</FooterLink>
            <FooterLink to="/programmes">Build</FooterLink>
            <FooterLink to="/programmes">Blueprint</FooterLink>
          </FooterCol>

          <FooterCol title="Brand">
            <FooterLink to="/apparel">Apparel</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/my-programmes">My programmes</FooterLink>
          </FooterCol>

          <FooterCol title="Support">
            <FooterLink to="/about">Contact</FooterLink>
            <span className="text-foreground-muted text-xs">Terms — soon</span>
            <span className="text-foreground-muted text-xs">Privacy — soon</span>
          </FooterCol>
        </div>

        <div className="mt-16 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between gap-2 text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
          <span>© {new Date().getFullYear()} SEVEN3SEVEN. All rights reserved.</span>
          <span>Built for performance.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-bone text-xs hover:text-signal transition-colors"
    >
      {children}
    </Link>
  );
}
