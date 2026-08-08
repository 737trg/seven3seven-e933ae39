import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PUBLIC_PROGRAMMES, statusLabel } from "@/data/publicProgrammes";
import { CART_CATALOG, type CartItemSlug } from "@/lib/cart";

function priceFor(slug: string): string | null {
  const entry = CART_CATALOG[slug as CartItemSlug];
  return entry ? `£${(entry.pricePence / 100).toFixed(2)}` : null;
}

export function ProgrammeCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-card]");
    const step = first ? first.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // drag-to-scroll
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 8) {
      if (!drag.current.moved) {
        drag.current.moved = true;
        try { el.setPointerCapture(e.pointerId); } catch {}
      }
      el.scrollLeft = drag.current.startScroll - dx;
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current.active = false;
    try {
      trackRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-5 lg:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide select-none cursor-grab active:cursor-grabbing pb-2 -mx-6 lg:-mx-12 px-6 lg:px-12"
        style={{ scrollbarWidth: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {PUBLIC_PROGRAMMES.map((p) => (
          <Link
            key={p.slug}
            data-card
            to="/programmes/$slug"
            params={{ slug: p.slug }}
            draggable={false}
            className="group relative shrink-0 snap-start block overflow-hidden ring-1 ring-border hover:ring-bone/40 transition-all panel-dark
              w-[82vw] sm:w-[60vw] md:w-[44vw] lg:w-[32vw] xl:w-[28vw] max-w-[460px] aspect-[4/5]"
          >
            <img
              src={p.image}
              alt={`${p.title} — SEVEN3SEVEN hybrid training programme`}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div aria-hidden className="absolute inset-0 scrim-bottom" />
            <div className="relative z-10 h-full p-6 lg:p-7 flex flex-col">
              <div className="flex items-start justify-between">
                <p className="eyebrow text-bone/80 tabular">{p.num}</p>
                <p className="eyebrow text-bone/55">{statusLabel(p.status)}</p>
              </div>
              <div className="flex-1" />
              <div>
                <p className="eyebrow text-bone/70 mb-3">{p.collection}</p>
                <h3 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] text-3xl lg:text-4xl xl:text-[2.75rem] group-hover:text-signal transition-colors">
                  {p.title}
                </h3>
                <p className="text-bone/80 text-sm mt-3 max-w-[32ch] leading-relaxed">
                  {p.shortLine}
                </p>
                <div className="mt-5 pt-4 border-t border-bone/20 flex items-center justify-between gap-3">
                  <span className="font-display text-bone text-lg tabular">
                    {priceFor(p.slug) ?? "Coming soon"}
                  </span>
                  <span className="eyebrow text-bone/70">{p.durationWeeks} weeks</span>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-bone font-display uppercase text-[11px] tracking-[0.28em] pb-1.5 border-b border-bone/70 group-hover:border-signal group-hover:text-signal transition-colors">
                  View programme <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
        <div className="shrink-0 w-2" aria-hidden />
      </div>

      {/* Arrows — desktop only */}
      <div className="hidden md:flex items-center justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label="Previous programmes"
          className="h-12 w-12 inline-flex items-center justify-center ring-1 ring-border text-bone hover:ring-bone disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label="Next programmes"
          className="h-12 w-12 inline-flex items-center justify-center ring-1 ring-border text-bone hover:ring-bone disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}