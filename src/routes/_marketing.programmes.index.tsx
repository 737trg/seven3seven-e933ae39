import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";
import { ProgrammeCarousel } from "@/components/marketing/ProgrammeCarousel";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/programmes/")({
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
      {/* HERO — image first, text block below */}
      <section className="relative">
        <img
          src={heroAsset.url}
          alt=""
          aria-hidden
          className="block w-full h-auto bg-background select-none"
          draggable={false}
        />
        <div className="bg-background">
          <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 pt-16 md:pt-24 lg:pt-28 pb-14 md:pb-20 lg:pb-24">
            <p className="eyebrow text-foreground-muted mb-6 md:mb-8">Programmes</p>
            <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.88] text-[clamp(2.5rem,7vw,5.5rem)] max-w-[14ch]">
              Built for<br />a clear objective.
            </h1>
            <p className="text-bone/80 text-base md:text-lg mt-6 md:mt-7 max-w-[56ch] leading-relaxed">
              Choose the programme that matches the outcome you're training for.
            </p>
            <p className="text-foreground-muted text-sm mt-4 max-w-[56ch]">
              Buy once. Follow it interactively. Log your work. Keep the PDF.
            </p>
          </div>
        </div>
      </section>

      {/* CATALOGUE — horizontal carousel */}
      <section id="catalogue" className="border-t border-border/60">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-6 mb-10 lg:mb-14">
            <p className="eyebrow lg:col-span-2">Catalogue</p>
            <h2 className="lg:col-span-10 font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(1.75rem,3.5vw,2.75rem)] max-w-[28ch]">
              Four programmes. One standard of delivery.
            </h2>
          </div>
          <ProgrammeCarousel />
        </div>
      </section>

      {/* STATUS */}
      <section className="border-t border-border/60">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5 text-signal">Status</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[18ch]">
              Three programmes.<br />Built to perform.
            </h2>
            <p className="text-foreground-muted text-sm md:text-base mt-6 max-w-[52ch]">
              Structured training for service preparation, competition and hybrid racing.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <button
              onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors"
            >
              CHOOSE YOUR PROGRAMME <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
