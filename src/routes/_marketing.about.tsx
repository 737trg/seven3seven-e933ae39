import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroAsset from "@/assets/seven3seven-hero.jpg.asset.json";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/about")({
  head: () => ({
    meta: [
      { title: "About — SEVEN3SEVEN" },
      {
        name: "description",
        content:
          "SEVEN3SEVEN builds hybrid fitness and performance programmes. Built by Nico — coach, athlete and competitor.",
      },
      { property: "og:title", content: "About — SEVEN3SEVEN" },
      {
        property: "og:description",
        content: "Built for performance. Designed for life.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/about` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      {/* HERO — cinematic */}
      <section className="relative">
        <div className="relative w-full h-[72svh] min-h-[480px] max-h-[780px] overflow-hidden">
          <img
            src={heroAsset.url}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-[75%_30%]"
          />
          <div aria-hidden className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(8,8,8,0.35) 0%, rgba(8,8,8,0.4) 55%, rgba(8,8,8,0.95) 100%)"}} />
          <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col justify-end pb-14 lg:pb-20">
            <p className="eyebrow text-bone/70 mb-5">About</p>
            <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.88] text-[clamp(2.75rem,8vw,7rem)] max-w-[12ch]">
              Built for performance.
              <br />
              <span className="text-foreground-muted">Designed for life.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">Philosophy</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5.5vw,4.5rem)] max-w-[20ch]">
              Capability over specialisation.
            </h2>
            <p className="text-bone text-lg md:text-xl mt-10 max-w-[52ch] leading-[1.5]">
              Strength. Endurance. Conditioning. One complete approach.
            </p>
            <p className="text-foreground-muted text-sm md:text-base mt-6 max-w-[52ch]">
              Balanced. Measurable. Repeatable.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER — image-led */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <img
              src={heroAsset.url}
              alt="Nico, founder of SEVEN3SEVEN"
              className="w-full aspect-[4/5] object-cover object-[72%_center]"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-6">
            <p className="eyebrow mb-6">Founder</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)]">
              Nico.
            </h2>
            <div className="mt-8 text-foreground-muted text-base leading-[1.6] space-y-5 max-w-[48ch]">
              <p>
                Former Army physical training instructor. Coach, athlete, competitor.
              </p>
              <p>
                SEVEN3SEVEN was shaped through practical training and competition preparation —
                programming clear enough to follow, strong enough to produce results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-9">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[20ch]">
              You bring the work.
              <br />
              <span className="text-foreground-muted">We'll build the plan.</span>
            </h2>
          </div>
          <div className="lg:col-span-3 lg:text-right">
            <Link
              to="/programmes"
              className="inline-flex items-center gap-3 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-2 border-b border-bone/40 hover:border-bone transition-colors"
            >
              Programmes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
