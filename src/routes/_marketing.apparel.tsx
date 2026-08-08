import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://737trg.com";

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
    <section className="min-h-[calc(100svh-9rem)] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="eyebrow text-foreground-muted">Apparel</p>
        <h1 className="mt-6 font-display font-bold text-bone tracking-[-0.04em] leading-[0.9] text-[clamp(2.75rem,12vw,8rem)]">
          DROP 01
        </h1>
        <p className="mt-6 eyebrow text-signal">Coming soon</p>
      </div>
    </section>
  );
}
