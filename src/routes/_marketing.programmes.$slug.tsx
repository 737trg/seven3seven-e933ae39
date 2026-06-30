import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { getPublicProgramme, PUBLIC_PROGRAMMES, statusLabel, type PublicProgramme } from "@/data/publicProgrammes";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/programmes/$slug")({
  loader: ({ params }) => {
    const programme = getPublicProgramme(params.slug);
    if (!programme) throw notFound();
    return { programme };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.programme;
    const title = p ? `${p.title} — SEVEN3SEVEN` : "Programme — SEVEN3SEVEN";
    const desc = p?.description ?? "Programme — SEVEN3SEVEN.";
    const url = p ? `${SITE}/programmes/${p.slug}` : `${SITE}/programmes`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(p?.image ? [{ property: "og:image", content: p.image }, { name: "twitter:image", content: p.image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-32">
      <p className="eyebrow text-signal mb-4">Not found</p>
      <h1 className="font-display font-bold text-bone text-4xl mb-6">Programme not found.</h1>
      <Link to="/programmes" className="eyebrow text-bone inline-flex items-center gap-2 hover:text-signal">
        <ArrowLeft className="h-3 w-3" /> All programmes
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { programme: p } = Route.useLoaderData() as { programme: PublicProgramme };
  const [track, setTrack] = useState(p.tracks?.[0]?.id ?? "");

  const otherProgrammes = PUBLIC_PROGRAMMES.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <img
          src={p.image}
          alt={p.title}
          className="block w-full h-[60vh] md:h-[72vh] lg:h-[80vh] object-cover select-none"
          draggable={false}
        />
        <div aria-hidden className="absolute inset-0 scrim-bottom" />
        <div className="absolute inset-x-0 top-0">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-6 lg:pt-8">
            <Link to="/programmes" className="eyebrow text-bone/80 hover:text-bone inline-flex items-center gap-2">
              <ArrowLeft className="h-3 w-3" /> All programmes
            </Link>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pb-10 lg:pb-16">
            <div className="flex items-center gap-4 mb-5">
              <span className="eyebrow text-bone/80 tabular">{p.num}</span>
              <span className="h-px w-8 bg-bone/40" />
              <span className="eyebrow text-bone/80">{p.collection}</span>
              <span className="h-px w-8 bg-bone/40 hidden md:inline-block" />
              <span className="hidden md:inline eyebrow text-bone/55">{statusLabel(p.status)}</span>
            </div>
            <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.9] text-[clamp(2.5rem,8vw,6.25rem)] max-w-[18ch]">
              {p.title}
            </h1>
            <p className="text-bone/85 text-lg md:text-xl mt-6 max-w-[44ch]">{p.shortLine}</p>
          </div>
        </div>
      </section>

      {/* OVERVIEW + META */}
      <section className="border-t border-border/60">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6">Overview</p>
            <p className="font-display text-bone text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.2] tracking-[-0.02em] max-w-[34ch]">
              {p.description}
            </p>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-border/60 lg:pl-12 grid grid-cols-2 gap-8 content-start">
            <Meta k="Duration" v={`${p.durationWeeks} weeks`} />
            <Meta k="Collection" v={p.collection} />
            <Meta k="Format" v="Interactive + PDF" />
            <Meta k="Status" v={statusLabel(p.status)} />
          </div>
        </div>
      </section>

      {/* WHAT + WHO */}
      <section className="border-t border-border/60 panel-dark">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="eyebrow mb-6">What you'll do</p>
            <ul className="space-y-4">
              {p.whatYoullDo.map((w: string) => (
                <li key={w} className="flex items-start gap-4 border-b border-border/60 pb-4 font-display text-bone text-lg md:text-xl tracking-[-0.01em]">
                  <span className="tabular text-foreground-muted text-xs pt-1.5 w-6 shrink-0">{String(p.whatYoullDo.indexOf(w) + 1).padStart(2, "0")}</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-6">Best for</p>
            <ul className="space-y-5">
              {p.bestFor.map((b: string) => (
                <li key={b} className="flex items-start gap-4 font-display text-bone text-lg md:text-xl tracking-[-0.01em] leading-snug">
                  <Check className="h-4 w-4 text-signal mt-1.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TRACK SELECTOR */}
      {p.tracks && (
        <section className="border-t border-border/60">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
            <p className="eyebrow mb-6">Choose your track</p>
            <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
              {p.tracks.map((t: { id: string; label: string; description: string }) => {
                const active = track === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTrack(t.id)}
                    className={`text-left p-8 lg:p-10 ring-1 transition-all ${
                      active ? "ring-bone bg-[#0d0d0d]" : "ring-border hover:ring-bone/50"
                    }`}
                    aria-pressed={active}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-display font-bold text-bone text-3xl lg:text-4xl tracking-[-0.025em]">{t.label}</span>
                      <span className={`h-5 w-5 rounded-full border ${active ? "bg-signal border-signal" : "border-bone/40"}`} />
                    </div>
                    <p className="text-bone/80 text-sm md:text-base max-w-[42ch] leading-relaxed">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* INCLUDED */}
      <section className="border-t border-border/60">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-6">What's included</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-[clamp(2rem,4vw,3.25rem)] max-w-[14ch]">
              Built to be followed properly.
            </h2>
          </div>
          <ul className="lg:col-span-8 grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {[
              "Interactive session-by-session delivery",
              "Built-in workout structure",
              "Logging and progress tracking",
              "Clear exercise guidance",
              "A downloadable PDF version",
              "A structured plan built to be followed",
            ].map((i) => (
              <li key={i} className="border-t border-border/60 pt-5 flex items-start gap-3">
                <Check className="h-4 w-4 text-signal mt-1 shrink-0" />
                <span className="font-display text-bone text-lg tracking-[-0.01em]">{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRICING + CTA */}
      <section className="border-t border-border/60 panel-dark">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-signal mb-6">Pricing</p>
            <div className="flex items-end flex-wrap gap-x-14 gap-y-8">
              <div>
                <p className="eyebrow text-bone/70 mb-3">Founding price</p>
                <p className="font-display font-bold text-bone tabular leading-none text-[clamp(3.5rem,8vw,6rem)] tracking-[-0.04em]">£19.99</p>
              </div>
              <div>
                <p className="eyebrow text-bone/55 mb-3">Standard</p>
                <p className="font-display text-foreground-muted tabular leading-none text-[clamp(2rem,4vw,3rem)] tracking-[-0.03em]">£29.99</p>
              </div>
            </div>
            <p className="text-foreground-muted text-sm mt-8 max-w-[42ch]">Founding pricing applies to early supporters of the programme.</p>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-3 px-8 py-5 bg-bone text-obsidian font-display uppercase text-[12px] tracking-[0.24em] opacity-90 cursor-not-allowed"
            >
              Purchases opening soon
            </button>
            <p className="eyebrow text-foreground-muted mt-5">{statusLabel(p.status)}</p>
          </div>
        </div>
      </section>

      {/* OTHER PROGRAMMES */}
      <section className="border-t border-border/60">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="flex items-end justify-between mb-10">
            <p className="eyebrow">More programmes</p>
            <Link to="/programmes" className="eyebrow text-bone inline-flex items-center gap-2 hover:text-signal">
              All programmes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {otherProgrammes.map((o) => (
              <Link
                key={o.slug}
                to="/programmes/$slug"
                params={{ slug: o.slug }}
                className="group relative block overflow-hidden aspect-[4/5] panel-dark ring-1 ring-border hover:ring-bone/40 transition-all"
              >
                <img src={o.image} alt={o.title} className="absolute inset-0 w-full h-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
                <div aria-hidden className="absolute inset-0 scrim-bottom" />
                <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                  <p className="eyebrow text-bone/70 mb-2">{o.collection}</p>
                  <h3 className="font-display font-bold text-bone text-2xl lg:text-3xl tracking-[-0.025em] group-hover:text-signal transition-colors">{o.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="eyebrow mb-2">{k}</p>
      <p className="font-display text-bone text-xl md:text-2xl tracking-[-0.02em]">{v}</p>
    </div>
  );
}