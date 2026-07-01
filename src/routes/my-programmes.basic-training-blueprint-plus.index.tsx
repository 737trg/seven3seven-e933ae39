import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/shell/Wordmark";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";

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
          <p className="eyebrow mb-8">Programme 03 · Foundation</p>
          <h1 className="font-display font-bold text-bone leading-[0.92] tracking-tight text-[clamp(3.5rem,10vw,8rem)]">
            BASIC TRAINING
            <br />
            <span className="text-signal">BLUEPRINT+</span>
          </h1>
          <p className="mt-8 max-w-[52ch] text-foreground-muted leading-relaxed">
            Foundational hybrid training. The blueprint for developing strength, engine and technical capacity before entering a competition block.
          </p>

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

          {entitled && (
            <div className="mt-12 flex flex-wrap gap-4">
              <button
                type="button"
                disabled
                title="Programme experience launching soon"
                className="h-12 px-8 inline-flex items-center bg-bone/40 text-obsidian/70 text-xs uppercase tracking-widest font-display cursor-not-allowed"
              >
                Start programme
              </button>
              <Link to="/my-programmes" className="h-12 px-8 inline-flex items-center border border-border text-bone text-xs uppercase tracking-widest font-display">
                Back to library
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
