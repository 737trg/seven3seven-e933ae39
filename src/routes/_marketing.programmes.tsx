import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/programmes")({
  head: () => ({
    meta: [
      { title: "Programmes — SEVEN3SEVEN" },
      {
        name: "description",
        content:
          "Structured hybrid training programmes from SEVEN3SEVEN. Compete, Build and Blueprint collections — coming soon.",
      },
      { property: "og:title", content: "Programmes — SEVEN3SEVEN" },
      {
        property: "og:description",
        content: "Built for a clear objective. Programmes coming soon.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/programmes` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/programmes` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE },
            { "@type": "ListItem", position: 2, name: "Programmes", item: `${SITE}/programmes` },
          ],
        }),
      },
    ],
  }),
  component: ProgrammesPage,
});

function ProgrammesPage() {
  return (
    <>
      {/* HERO — editorial */}
      <section>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-24 lg:pt-36 pb-16 lg:pb-24 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">Programmes</p>
          <div className="lg:col-span-10">
            <h1 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.92] text-[clamp(2.75rem,8vw,7rem)] max-w-[14ch]">
              Built for a clear objective.
            </h1>
            <p className="text-foreground-muted text-base md:text-lg mt-10 max-w-[52ch] leading-relaxed">
              Structured training to develop strength, endurance and the ability to perform when it matters.
              Buy once. Follow interactively. Keep the PDF.
            </p>
          </div>
        </div>
      </section>

      {/* COLLECTIONS — editorial rows */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <CollectionRow num="01" tag="Compete" title="Event-focused preparation." copy="Training built around a specific event, date or target." />
          <CollectionRow num="02" tag="Build" title="Strength + engine." copy="Progressive strength, endurance and hybrid development." />
          <CollectionRow num="03" tag="Blueprint" title="Foundations + return." copy="For athletes beginning, rebuilding or returning to structured training." />
        </div>
      </section>

      {/* RELEASE — minimal */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6">Release</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[18ch]">
              The first programmes are coming.
            </h2>
            <p className="text-foreground-muted text-sm md:text-base mt-6 max-w-[52ch]">
              Released when ready to be followed properly. No filler.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/about"
              className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone/40 hover:border-bone transition-colors"
            >
              Our approach <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CollectionRow({ num, tag, title, copy }: { num: string; tag: string; title: string; copy: string }) {
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-10 items-baseline border-b border-border/60 py-10 lg:py-14 group">
      <span className="col-span-2 lg:col-span-1 eyebrow text-foreground-muted tabular">{num}</span>
      <div className="col-span-10 lg:col-span-2">
        <p className="eyebrow text-bone">{tag}</p>
      </div>
      <h3 className="col-start-3 lg:col-start-auto col-span-10 lg:col-span-5 font-display font-bold text-bone tracking-[-0.02em] text-3xl md:text-5xl lg:text-6xl group-hover:text-signal transition-colors">
        {title}
      </h3>
      <p className="col-start-3 lg:col-start-auto col-span-10 lg:col-span-3 text-foreground-muted text-sm md:text-base max-w-[40ch]">
        {copy}
      </p>
      <span className="hidden lg:block col-span-1 eyebrow text-right text-foreground-muted">Soon</span>
    </div>
  );
}
