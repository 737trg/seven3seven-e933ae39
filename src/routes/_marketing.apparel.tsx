import { createFileRoute } from "@tanstack/react-router";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/apparel")({
  head: () => ({
    meta: [
      { title: "Apparel — SEVEN3SEVEN" },
      {
        name: "description",
        content:
          "Performance-led apparel from SEVEN3SEVEN. Minimal, functional and built to work. First drop coming soon.",
      },
      { property: "og:title", content: "Apparel — SEVEN3SEVEN" },
      {
        property: "og:description",
        content: "Built to train. Designed to live in. First drop coming soon.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/apparel` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/apparel` }],
  }),
  component: ApparelPage,
});

function ApparelPage() {
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
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 pt-16 md:pt-24 lg:pt-28 pb-14 md:pb-20 lg:pb-24">
            <p className="eyebrow text-foreground-muted mb-6 md:mb-8">Apparel</p>
            <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.9] text-[clamp(2.5rem,6.5vw,5.5rem)] max-w-[16ch]">
              Built to train.<br />
              <span className="text-foreground-muted">Designed to live in.</span>
            </h1>
            <p className="text-bone/80 text-base md:text-lg mt-6 md:mt-7 max-w-[52ch] leading-relaxed">
              Performance-led apparel shaped by the same principles as the training.
            </p>
            <p className="eyebrow text-signal mt-8">Drop 01 — in preparation</p>
          </div>
        </div>
      </section>

      {/* CAMPAIGN SPLIT */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-5 text-signal">Performance</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,4vw,3.25rem)]">
              Made to move,<br />train and repeat.
            </h2>
            <p className="text-foreground-muted text-sm md:text-base mt-6 max-w-[42ch]">
              Technical fabrics. Considered cuts. Built for the work it's worn for.
            </p>
          </div>
          <div className="lg:col-span-6">
            <p className="eyebrow mb-5">Essentials</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,4vw,3.25rem)]">
              Minimal pieces<br />for training and life.
            </h2>
            <p className="text-foreground-muted text-sm md:text-base mt-6 max-w-[42ch]">
              Pieces that earn their place — in the gym, on the road, and after.
            </p>
          </div>
        </div>
      </section>

      {/* EDITORIAL STRIP */}
      <section className="border-t border-border/60 panel-dark">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-12">
            <Tile k="Material" v="Selected to last." />
            <Tile k="Fit" v="Considered, athletic." />
            <Tile k="Function" v="Built for the work." />
            <Tile k="Restraint" v="Nothing unnecessary." />
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <p className="eyebrow mb-5 text-signal">Status</p>
          <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[14ch]">
            Drop 01<br />in development.
          </h2>
        </div>
      </section>

    </>
  );
}

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-border/60 pt-5">
      <p className="eyebrow text-bone mb-3">{k}</p>
      <p className="font-display text-bone text-xl md:text-2xl tracking-[-0.02em] leading-snug">{v}</p>
    </div>
  );
}
