import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui-prim/Button";
import { Wordmark } from "@/components/shell/Wordmark";
import { ArrowRight } from "lucide-react";
import { AthxAccessGate } from "@/lib/athxAccess";

/**
 * Preserved ATHX 2026 programme cover.
 * This is the exact landing component that previously lived at "/".
 * Behaviour, copy and layout are intentionally unchanged.
 */
export const Route = createFileRoute("/my-programmes/athx-2026")({
  head: () => ({
    meta: [
      { title: "ATHX 2026 — 737 TRG" },
      { name: "description", content: "ATHX 2026 — Nico's personalised programme cover." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AthxCoverRoute,
});

function AthxCoverRoute() {
  return (
    <AthxAccessGate>
      <AthxCover />
    </AthxAccessGate>
  );
}

function AthxCover() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* nav */}
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-10 py-6">
          <Wordmark size="md" />
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-foreground-muted">
            <span>ATHX Birmingham · 23.08.2026</span>
            <Button to="/today" variant="outline">
              Enter app <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button to="/today" variant="outline" className="md:hidden">
            Enter
          </Button>
        </div>
      </header>

      {/* hero */}
      <section className="relative min-h-screen flex flex-col">
        {/* image area */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(216,41,50,0.18), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(255,255,255,0.05), transparent 50%), linear-gradient(180deg, #090909 0%, #0c0c0c 100%)",
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-[1280px] mx-auto w-full px-6 lg:px-10 pb-20 pt-40">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-8">Programme 01 · Hybrid Performance</p>
              <h1 className="font-display font-bold text-bone leading-[0.92] tracking-tight text-[clamp(3.5rem,11vw,9rem)]">
                ATHX
                <br />
                2026.
              </h1>
              <p className="font-display text-foreground-muted text-xl md:text-2xl mt-8 max-w-xl leading-snug">
                Strong enough to lift heavy.
                <br />
                Fit enough to keep moving.
                <br />
                <span className="text-bone">Prepared enough to do both when it counts.</span>
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ul className="text-xs uppercase tracking-widest text-foreground-muted space-y-2.5">
                <li className="flex justify-between border-b border-border pb-2.5">
                  <span>Build</span>
                  <span className="text-bone">Seven weeks</span>
                </li>
                <li className="flex justify-between border-b border-border pb-2.5">
                  <span>Taper</span>
                  <span className="text-bone">Race week</span>
                </li>
                <li className="flex justify-between border-b border-border pb-2.5">
                  <span>Pillars</span>
                  <span className="text-bone">Strength · Endurance · MetCon</span>
                </li>
                <li className="flex justify-between">
                  <span>Measured</span>
                  <span className="text-bone">Every session</span>
                </li>
              </ul>
              <Button to="/today" variant="accent" size="lg" className="w-full">
                View programme <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-foreground-muted border-t border-border pt-6">
            <span>737 TRG · Performance label</span>
            <span>Built for Nico · Men's Pairs · ATHX Pro</span>
            <span>v1.0 · Prepared 30.06.2026</span>
          </div>
        </div>
      </section>
    </main>
  );
}
