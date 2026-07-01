import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Download } from "lucide-react";
import { Wordmark } from "@/components/shell/Wordmark";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { btbStore, useBtbStarted } from "@/lib/btb/store";
import { getProgrammeDownloadUrl } from "@/lib/pdf.functions";
import { ensureEnrolment } from "@/lib/enrolment.functions";

export const Route = createFileRoute("/my-programmes/basic-training-blueprint-plus/")({
  head: () => ({
    meta: [
      { title: "Basic Training Blueprint+ — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Basic Training Blueprint+ — programme cover." },
    ],
  }),
  component: BtbCover,
});

function BtbCover() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading: entLoading } = useEntitlements(user?.id);
  const started = useBtbStarted();
  const navigate = useNavigate();
  const getUrl = useServerFn(getProgrammeDownloadUrl);
  const startEnrolment = useServerFn(ensureEnrolment);
  const [starting, setStarting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const entitled =
    !authLoading && !entLoading && items.some((i) => i.slug === "basic-training-blueprint-plus");

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-10 py-6">
          <Wordmark size="md" />
          <Link to="/my-programmes" className="text-xs uppercase tracking-widest text-foreground-muted hover:text-bone">
            My programmes
          </Link>
        </div>
      </header>

      <section className="relative min-h-screen flex flex-col">
        <div
          aria-hidden
          className="absolute inset-0 z-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 80% 15%, rgba(216,41,50,0.12), transparent 55%), linear-gradient(180deg, #090909 0%, #0c0c0c 100%)",
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-[1280px] mx-auto w-full px-6 lg:px-10 pb-20 pt-40">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-8">Programme 03 · Foundation</p>
              <h1 className="font-display font-bold text-bone leading-[0.92] tracking-tight text-[clamp(3.5rem,10vw,8rem)]">
                BASIC TRAINING
                <br />
                <span className="text-signal">BLUEPRINT+</span>
              </h1>
              <p className="font-display text-foreground-muted text-xl md:text-2xl mt-8 max-w-xl leading-snug">
                Build the fitness, strength and durability<br />
                required for the physical demands ahead.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ul className="text-xs uppercase tracking-widest text-foreground-muted space-y-2.5">
                <Row k="Duration" v="Twelve weeks" />
                <Row k="Weekly training" v="Five days" />
                <Row k="Level" v="Foundation" />
                <Row k="Pillars" v="Strength · Engine · Durability" />
                <Row k="Version" v="1.0.0" last />
              </ul>
              {entitled && (
                <button
                  disabled={starting}
                  onClick={async () => {
                    setStarting(true);
                    try {
                      await startEnrolment({ data: { slug: "basic-training-blueprint-plus" } });
                      if (!started.started) btbStore.markStarted();
                      navigate({ to: "/my-programmes/basic-training-blueprint-plus/today" });
                    } finally { setStarting(false); }
                  }}
                  className="h-12 px-6 inline-flex items-center justify-center gap-3 bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display disabled:opacity-60"
                >
                  {starting ? "Preparing…" : started.started ? "Continue programme" : "Ready to start"} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              {entitled && (
                <button
                  disabled={downloading}
                  onClick={async () => {
                    setDownloadError(null); setDownloading(true);
                    try {
                      const r = await getUrl({ data: { slug: "basic-training-blueprint-plus" } });
                      window.open(r.url, "_blank", "noopener,noreferrer");
                    } catch (e: any) { setDownloadError(e?.message ?? "Could not generate download."); }
                    finally { setDownloading(false); }
                  }}
                  className="h-12 px-6 inline-flex items-center justify-center gap-3 border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" /> {downloading ? "Preparing…" : "Download PDF"}
                </button>
              )}
              {downloadError && <p className="text-signal text-xs">{downloadError}</p>}
            </div>
          </div>

          {!authLoading && !user && (
            <div className="mt-10">
              <p className="text-[10px] uppercase tracking-widest text-foreground-muted">
                Sign in with your account to access this programme.
              </p>
              <div className="mt-4 flex gap-4">
                <Link to="/sign-in" className="h-11 px-6 inline-flex items-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">Sign in</Link>
              </div>
            </div>
          )}

          {user && !entLoading && !entitled && (
            <div className="mt-10">
              <p className="text-[10px] uppercase tracking-widest text-foreground-muted">
                You don't have access to this programme yet.
              </p>
              <div className="mt-4">
                <Link to="/programmes/basic-training-blueprint-plus" className="text-xs uppercase tracking-widest text-bone underline underline-offset-4">
                  View public overview
                </Link>
              </div>
            </div>
          )}

          <div className="mt-20 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-foreground-muted border-t border-border pt-6">
            <span>SEVEN3SEVEN · Foundation</span>
            <span>Independent of the British Army and Ministry of Defence</span>
            <span>v1.0.0</span>
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
