import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";
import { Seven3SevenLogo } from "./Seven3SevenLogo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10">
          <div className="col-span-2 md:col-span-2">
            <Seven3SevenLogo height={28} />
            <p className="text-foreground-muted text-xs mt-5 max-w-[24ch]">
              Hybrid fitness and performance programmes. Built to be followed.
            </p>
            <div className="mt-6 flex items-center gap-3 text-foreground-muted">
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
            <span className="text-foreground-muted text-xs">Terms — coming soon</span>
            <span className="text-foreground-muted text-xs">Privacy — coming soon</span>
          </FooterCol>

          <FooterCol title="Train with purpose.">
            <p className="text-foreground-muted text-xs">
              Early access notifications launch with the first programmes.
            </p>
            <p className="eyebrow mt-2 text-signal">Early access coming soon</p>
          </FooterCol>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-2 text-[10px] uppercase tracking-widest text-foreground-muted">
          <span>© {new Date().getFullYear()} SEVEN3SEVEN. All rights reserved.</span>
          <span>Built for performance. Designed for life.</span>
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
