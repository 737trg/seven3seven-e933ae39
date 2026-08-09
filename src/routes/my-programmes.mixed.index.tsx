import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/shell/Wordmark";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { mixedStore, useMixedStarted } from "@/lib/mixed/store";
import { PdfDownloadLink } from "@/components/dashboard/PdfDownloadLink";
import pdfAsset from "@/assets/mixed-download.pdf.asset.json";

export const Route = createFileRoute("/my-programmes/mixed/")({
  head: () => ({
    meta: [
      { title: "MIXED — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "MIXED — programme cover." },
    ],
  }),
  component: MixedCover,
});

function MixedCover() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading: entLoading } = useEntitlements(user?.id);
  const started = useMixedStarted();
  const navigate = useNavigate();

  const entitled = !authLoading && !entLoading && items.some((i) => i.slug === "mixed");

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-10 py-6">
          <Wordmark size="md" />
          <Link to="/my-programmes" className="text-xs uppercase tracking-widest text-foreground-muted hover:text-bone">My programmes</Link>
        </div>
      </header>

      <section className="relative min-h-screen flex flex-col">
        <div
          aria-hidden
          className="absolute inset-0 z-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(216,41,50,0.16), transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(255,255,255,0.05), transparent 50%), linear-gradient(180deg, #090909 0%, #0c0c0c 100%)",
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-[1280px] mx-auto w-full px-6 lg:px-10 pb-20 pt-40">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-8">Programme 05 · Build</p>
              <h1 className="font-display font-bold text-bone leading-[0.92] tracking-tight text-[clamp(3.5rem,11vw,9rem)]">
                MIXED.
              </h1>
              <p className="font-display text-foreground-muted text-xl md:text-2xl mt-8 max-w-xl leading-snug">
                Strength you can use.
                <br />
                Skill under fatigue.
                <br />
                <span className="text-bone">An engine that keeps showing up.</span>
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ul className="text-xs uppercase tracking-widest text-foreground-muted space-y-2.5">
                <Row k="Duration" v="Twelve weeks" />
                <Row k="Core training" v="Five days" />
                <Row k="Optional recovery" v="One day" />
                <Row k="Focus" v="Strength · Skill · Conditioning" />
                <Row k="Tracks" v="RX and Scaled" last />
              </ul>
              <button
                onClick={() => {
                  if (!entitled) { navigate({ to: "/my-programmes" }); return; }
                  if (!started.started) mixedStore.markStarted();
                  navigate({ to: "/my-programmes/mixed/today" });
                }}
                className="h-12 px-6 inline-flex items-center justify-center gap-3 bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display"
              >
                {started.started ? "Continue programme" : "Start programme"} <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <PdfDownloadLink slug="mixed" href={pdfAsset.url} label="Download PDF" />
              {!entitled && !entLoading && (
                <p className="text-foreground-muted text-[10px] uppercase tracking-widest">Sign in with your owner account to unlock.</p>
              )}
            </div>
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-foreground-muted border-t border-border pt-6">
            <span>SEVEN3SEVEN · Build</span>
            <span>Functional fitness · RX or Scaled</span>
            <span>Twelve weeks</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <li className={`flex justify-between ${last ? "" : "border-b border-border pb-2.5"}`}>
      <span>{k}</span>
      <span className="text-bone">{v}</span>
    </li>
  );
}