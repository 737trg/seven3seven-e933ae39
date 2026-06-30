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
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 80% 30%, rgba(216,41,50,0.16), transparent 55%), linear-gradient(180deg, #080808 0%, #0c0c0c 100%)",
          }}
        />
        <div className="relative max-w-[1280px] mx-auto px-5 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <p className="eyebrow mb-6 text-signal">Programmes</p>
          <h1 className="font-display font-bold text-bone leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,5.5rem)]">
            BUILT FOR
            <br />
            A CLEAR OBJECTIVE.
          </h1>
          <p className="text-foreground-muted text-base md:text-lg mt-8 max-w-[58ch] leading-relaxed">
            Structured training designed to develop strength, endurance and the ability to perform when it matters.
            Buy once. Follow interactively. Keep the PDF.
          </p>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-16 lg:py-24">
          <div className="grid md:grid-cols-3 gap-5">
            <CollectionCard
              tag="Compete"
              title="Event-focused preparation"
              copy="Training built around a specific event, date or target."
            />
            <CollectionCard
              tag="Build"
              title="Structured strength + engine"
              copy="Progressive strength, endurance and hybrid development."
            />
            <CollectionCard
              tag="Blueprint"
              title="Foundations + return-to-training"
              copy="Clear foundations for athletes beginning, rebuilding or returning to structured training."
            />
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 text-center">
          <p className="eyebrow text-signal mb-4">Catalogue status</p>
          <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight">
            PROGRAMMES COMING SOON.
          </h2>
          <p className="text-foreground-muted text-sm mt-6 max-w-[52ch] mx-auto leading-relaxed">
            The first SEVEN3SEVEN programmes are currently being built and tested.
            Every programme will be released when it is ready to be followed properly.
          </p>
          <Link
            to="/about"
            className="mt-10 inline-flex items-center gap-2 h-12 px-6 border border-border text-bone font-display uppercase text-xs tracking-[0.18em] hover:border-bone transition-colors rounded-[2px]"
          >
            Read our approach <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function CollectionCard({ tag, title, copy }: { tag: string; title: string; copy: string }) {
  return (
    <article className="border border-border bg-surface/30 p-7 lg:p-9 rounded-[2px] min-h-[260px] flex flex-col">
      <p className="eyebrow text-signal mb-5">{tag}</p>
      <h3 className="font-display font-bold text-bone text-2xl lg:text-3xl tracking-tight leading-[1.05]">
        {title}
      </h3>
      <p className="text-foreground-muted text-sm mt-4 leading-relaxed">{copy}</p>
      <p className="eyebrow mt-auto pt-6">Coming soon</p>
    </article>
  );
}
