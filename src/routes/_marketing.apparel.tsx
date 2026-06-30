import { createFileRoute } from "@tanstack/react-router";

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
      {/* HERO */}
      <section>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-24 lg:pt-36 pb-16 lg:pb-24 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">Apparel</p>
          <div className="lg:col-span-10">
            <h1 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.92] text-[clamp(2.75rem,8vw,7rem)] max-w-[14ch]">
              Built to train.
              <br />
              <span className="text-foreground-muted">Designed to live in.</span>
            </h1>
            <p className="text-foreground-muted text-base md:text-lg mt-10 max-w-[48ch] leading-relaxed">
              Performance-led apparel shaped by the same principles as the training. Purposeful. Minimal. Made to work.
            </p>
          </div>
        </div>
      </section>

      {/* CAMPAIGN PLATE — single large quiet panel */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div
            aria-hidden
            className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.04), transparent 60%), linear-gradient(180deg, #0a0a0a 0%, #131313 100%)",
            }}
          >
            <div className="absolute inset-0 grain" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-14">
              <p className="eyebrow text-bone/70">Campaign 01 — In preparation</p>
              <p className="font-display text-bone text-2xl md:text-4xl tracking-[-0.02em] mt-3 max-w-[24ch]">
                The first drop is being made.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES — typographic, no boxes */}
      <section className="border-t border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">Principles</p>
          <div className="lg:col-span-10 grid sm:grid-cols-2 gap-x-12 gap-y-12">
            <Principle k="Minimal" v="Quiet detailing. No unnecessary noise." />
            <Principle k="Functional" v="Designed for the work it's worn for." />
            <Principle k="Durable" v="Materials selected to last." />
            <Principle k="Purposeful" v="Every piece earns its place." />
          </div>
        </div>
      </section>
    </>
  );
}

function Principle({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-border/60 pt-5">
      <p className="font-display text-bone text-xl md:text-2xl tracking-[-0.02em]">{k}</p>
      <p className="text-foreground-muted text-sm mt-2 max-w-[34ch]">{v}</p>
    </div>
  );
}
