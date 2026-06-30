import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";
import todayShot from "@/assets/athx-today.png.asset.json";
import progShot from "@/assets/athx-programme.png.asset.json";

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
      {/* HERO — cinematic */}
      <section className="relative">
        <div className="relative w-full h-[68svh] min-h-[460px] max-h-[760px] overflow-hidden">
          <img
            src={heroAsset.url}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-[78%_30%]"
          />
          <div aria-hidden className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(8,8,8,0.4) 0%, rgba(8,8,8,0.55) 60%, rgba(8,8,8,0.95) 100%)"}} />
          <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col justify-end pb-14 lg:pb-20">
            <p className="eyebrow text-bone/70 mb-5">Programmes</p>
            <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.88] text-[clamp(2.75rem,8vw,7rem)] max-w-[14ch]">
              Built for<br />a clear objective.
            </h1>
            <p className="text-bone/80 text-base md:text-lg mt-8 max-w-[52ch] leading-relaxed">
              Structured training for strength, endurance and performance.
            </p>
          </div>
        </div>
      </section>

      {/* COLLECTIONS — image panels */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <Panel num="01" tag="Compete" copy="Event-focused preparation." focal="60% 30%" />
            <Panel num="02" tag="Build" copy="Strength, endurance and hybrid development." focal="45% 55%" tone />
            <Panel num="03" tag="Blueprint" copy="Foundations and return-to-training." focal="35% 70%" />
          </div>
        </div>
      </section>

      {/* DELIVERY — real app screens */}
      <section className="border-t border-border/60 panel-dark">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-6">Delivery</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,4.5vw,3.75rem)] max-w-[14ch]">
              Built to be followed.
            </h2>
            <p className="text-bone/80 text-base md:text-lg mt-6 max-w-[42ch] leading-[1.55]">
              Every session, every block — laid out clearly and logged as you train.
            </p>
            <p className="text-foreground-muted text-sm mt-5 max-w-[42ch]">
              Buy once. Follow interactively. Keep the PDF.
            </p>
          </div>
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[5/4] panel-dark grain ring-1 ring-border overflow-hidden">
              <div className="absolute right-[6%] top-[8%] w-[44%] aspect-[9/19] rotate-[5deg] ring-1 ring-border/60 overflow-hidden bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                <img src={progShot.url} alt="ATHX programme view" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <div className="absolute left-[8%] bottom-[6%] w-[50%] aspect-[9/19] -rotate-[3deg] ring-1 ring-border overflow-hidden bg-black shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9)]">
                <img src={todayShot.url} alt="ATHX today screen" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5 text-signal">Status</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[18ch]">
              First programmes<br />in development.
            </h2>
            <p className="text-foreground-muted text-sm md:text-base mt-6 max-w-[52ch]">
              Released when ready to be followed properly. No filler.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/about"
              className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone hover:border-signal hover:text-signal transition-colors"
            >
              Our approach <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Panel({ num, tag, copy, focal, tone }: { num: string; tag: string; copy: string; focal: string; tone?: boolean }) {
  return (
    <div className="group relative overflow-hidden aspect-[4/5] panel-dark ring-1 ring-border">
      <img
        src={heroAsset.url}
        alt=""
        aria-hidden
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${tone ? "grayscale opacity-55" : "opacity-70"}`}
        style={{ objectPosition: focal }}
        loading="lazy"
      />
      <div aria-hidden className="absolute inset-0 scrim-bottom" />
      <div className="relative z-10 h-full p-6 lg:p-7 flex flex-col">
        <div className="flex items-start justify-between">
          <p className="eyebrow text-bone/80 tabular">{num}</p>
          <p className="eyebrow text-bone/55">Programmes coming soon</p>
        </div>
        <div className="flex-1" />
        <div>
          <h3 className="font-display font-bold text-bone tracking-[-0.025em] text-4xl lg:text-5xl">
            {tag}
          </h3>
          <p className="text-bone/75 text-sm mt-3 max-w-[28ch]">{copy}</p>
        </div>
      </div>
    </div>
  );
}
