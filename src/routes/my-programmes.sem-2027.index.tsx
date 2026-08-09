import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Download } from "lucide-react";
import { Wordmark } from "@/components/shell/Wordmark";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { sem27Store, useSem27Started } from "@/lib/sem2027/store";
import { getProgrammeDownloadUrl } from "@/lib/pdf.functions";

export const Route = createFileRoute("/my-programmes/sem-2027/")({
  head: () => ({
    meta: [
      { title: "S.E.M. 2027 — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "S.E.M. 2027 — programme cover." },
    ],
  }),
  component: SemCover,
});

function SemCover() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading: entLoading } = useEntitlements(user?.id);
  const started = useSem27Started();
  const navigate = useNavigate();
  const getUrl = useServerFn(getProgrammeDownloadUrl);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const entitled = !authLoading && !entLoading && items.some((i) => i.slug === "sem-2027");

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-10 py-6">
          <Wordmark size="md" />
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-foreground-muted">
            <Link to="/my-programmes" className="hover:text-bone">My programmes</Link>
          </div>
          <Link to="/my-programmes" className="md:hidden text-xs uppercase tracking-widest text-foreground-muted">Back</Link>
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
              <p className="eyebrow mb-8">Programme 02 · Compete</p>
              <h1 className="font-display font-bold text-bone leading-[0.92] tracking-tight text-[clamp(3.5rem,11vw,9rem)]">
                S.E.M.
                <br />
                8.
              </h1>
              <p className="font-display text-foreground-muted text-xl md:text-2xl mt-8 max-w-xl leading-snug">
                Strong enough to lift heavy.
                <br />
                Fit enough to keep moving.
                <br />
                <span className="text-bone">Prepared enough to perform under fatigue.</span>
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ul className="text-xs uppercase tracking-widest text-foreground-muted space-y-2.5">
                <Row k="Duration" v="Eight weeks" />
                <Row k="Core training" v="Five days" />
                <Row k="Optional development" v="One day" />
                <Row k="Pillars" v="Strength · Endurance · MetCon" />
                <Row k="Measured" v="Every session" last />
              </ul>
              <button
                onClick={() => {
                  if (!entitled) { navigate({ to: "/my-programmes" }); return; }
                  if (!started.started) sem27Store.markStarted();
                  navigate({ to: "/my-programmes/sem-2027/today" });
                }}
                className="h-12 px-6 inline-flex items-center justify-center gap-3 bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display"
              >
                {started.started ? "Continue programme" : "Start programme"} <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                disabled={!entitled || downloading}
                onClick={async () => {
                  setDownloadError(null); setDownloading(true);
                  try {
                    const r = await getUrl({ data: { slug: "sem-2027" } });
                    window.open(r.url, "_blank", "noopener,noreferrer");
                  } catch (e: any) { setDownloadError(e?.message ?? "Could not generate download."); }
                  finally { setDownloading(false); }
                }}
                className="h-12 px-6 inline-flex items-center justify-center gap-3 border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" /> {downloading ? "Preparing…" : "Download PDF"}
              </button>
              {downloadError && <p className="text-signal text-xs">{downloadError}</p>}
              {!entitled && !entLoading && (
                <p className="text-foreground-muted text-[10px] uppercase tracking-widest">Sign in with your owner account to unlock.</p>
              )}
            </div>
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-foreground-muted border-t border-border pt-6">
            <span>SEVEN3SEVEN · Compete</span>
            <span>Intermediate to advanced · Individual or pairs</span>
            <span>v1.0.0 · Beta</span>
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