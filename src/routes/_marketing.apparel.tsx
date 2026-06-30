import { createFileRoute } from "@tanstack/react-router";
import { Layers, Wrench, Box, Sparkles } from "lucide-react";

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
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 70% 40%, rgba(255,255,255,0.05), transparent 55%), linear-gradient(180deg, #080808 0%, #0a0a0a 100%)",
          }}
        />
        <div className="relative max-w-[1280px] mx-auto px-5 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <p className="eyebrow mb-6 text-signal">Apparel</p>
          <h1 className="font-display font-bold text-bone leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,5.5rem)]">
            BUILT TO TRAIN.
            <br />
            <span className="text-foreground-muted">DESIGNED TO LIVE IN.</span>
          </h1>
          <p className="text-foreground-muted text-base md:text-lg mt-8 max-w-[58ch] leading-relaxed">
            Performance-led apparel shaped by the same principles as the training: purposeful, minimal and built to work.
          </p>
          <p className="eyebrow mt-8 text-signal">First drop coming soon</p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 grid md:grid-cols-2 gap-6">
          <EditorialBlock title="Performance" copy="Engineered for training. Fabrics, fits and details that move with you under load." accent />
          <EditorialBlock title="Essentials" copy="Everyday SEVEN3SEVEN pieces. Worn in. Worn out. Worn again." />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20">
          <p className="eyebrow mb-6">Design principles</p>
          <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight mb-12 max-w-[20ch]">
            FOUR PRINCIPLES. NO EXCEPTIONS.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Principle icon={<Layers className="h-5 w-5" />} title="Minimal" body="Quiet detailing. No unnecessary noise." />
            <Principle icon={<Wrench className="h-5 w-5" />} title="Functional" body="Designed for the work it's worn for." />
            <Principle icon={<Box className="h-5 w-5" />} title="Durable" body="Materials selected to last." />
            <Principle icon={<Sparkles className="h-5 w-5" />} title="Purposeful" body="Every piece earns its place." />
          </div>
        </div>
      </section>
    </>
  );
}

function EditorialBlock({ title, copy, accent }: { title: string; copy: string; accent?: boolean }) {
  return (
    <div className={`border border-border rounded-[2px] overflow-hidden min-h-[320px] grid grid-rows-[1fr_auto] ${accent ? "bg-surface/40" : ""}`}>
      <div
        aria-hidden
        className="grain"
        style={{
          background: accent
            ? "radial-gradient(ellipse at 50% 50%, rgba(216,41,50,0.16), transparent 55%), linear-gradient(135deg, #0e0e0e 0%, #161616 100%)"
            : "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.05), transparent 55%), linear-gradient(135deg, #0c0c0c 0%, #141414 100%)",
        }}
      />
      <div className="p-8">
        <p className="eyebrow text-signal mb-3">{title}</p>
        <p className="text-bone text-sm max-w-[40ch] leading-relaxed">{copy}</p>
        <p className="eyebrow mt-4">Coming soon</p>
      </div>
    </div>
  );
}

function Principle({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-border p-6 rounded-[2px]">
      <div className="text-signal mb-4">{icon}</div>
      <p className="font-display text-bone uppercase tracking-[0.12em] text-sm">{title}</p>
      <p className="text-foreground-muted text-xs mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
