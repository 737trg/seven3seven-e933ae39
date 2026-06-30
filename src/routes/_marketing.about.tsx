import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dumbbell, HeartPulse, Activity, Crosshair } from "lucide-react";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/about")({
  head: () => ({
    meta: [
      { title: "About — SEVEN3SEVEN" },
      {
        name: "description",
        content:
          "SEVEN3SEVEN builds hybrid fitness and performance programmes. Built by Nico — coach, athlete and competitor.",
      },
      { property: "og:title", content: "About — SEVEN3SEVEN" },
      {
        property: "og:description",
        content: "Built for performance. Designed for life.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/about` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 grain"
          style={{
            background:
              "radial-gradient(ellipse at 80% 30%, rgba(216,41,50,0.14), transparent 55%), linear-gradient(180deg, #080808 0%, #0c0c0c 100%)",
          }}
        />
        <div className="relative max-w-[1280px] mx-auto px-5 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <p className="eyebrow mb-6 text-signal">About SEVEN3SEVEN</p>
          <h1 className="font-display font-bold text-bone leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,5.5rem)]">
            BUILT FOR PERFORMANCE.
            <br />
            <span className="text-foreground-muted">DESIGNED FOR LIFE.</span>
          </h1>
          <p className="text-foreground-muted text-base md:text-lg mt-8 max-w-[58ch] leading-relaxed">
            SEVEN3SEVEN exists to help athletes build the strength, endurance and mental edge to perform when it counts.
            Our programmes are structured, purposeful and relentless in their pursuit of progress.
          </p>
          <p className="text-bone text-sm mt-6">No fluff. No shortcuts. Just training that works.</p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight leading-[1]">
              CAPABILITY OVER SPECIALISATION.
            </h2>
            <div className="mt-6 text-foreground-muted text-sm leading-relaxed space-y-3 max-w-[44ch]">
              <p>We believe athletes shouldn't have to choose between being strong, fit and capable.</p>
              <p>Our programming blends strength, endurance and conditioning into one complete approach.</p>
              <p className="text-bone">Balanced. Measurable. Repeatable.</p>
            </div>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Pillar icon={<Dumbbell className="h-5 w-5" />} title="Strength" body="Build real, usable strength with purposeful training." />
            <Pillar icon={<HeartPulse className="h-5 w-5" />} title="Endurance" body="Develop the engine to perform under pressure." />
            <Pillar icon={<Activity className="h-5 w-5" />} title="Conditioning" body="Train the ability to work hard, recover and repeat." />
            <Pillar icon={<Crosshair className="h-5 w-5" />} title="Performance" body="Bring it together to perform when it matters most." />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div
              aria-hidden
              className="aspect-[4/5] grain border border-border rounded-[2px]"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.06), transparent 55%), linear-gradient(180deg, #0c0c0c 0%, #161616 100%)",
              }}
            />
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow text-signal mb-5">Built by Nico</p>
            <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight leading-[1]">
              COACH.
              <br />
              ATHLETE.
              <br />
              COMPETITOR.
            </h2>
            <div className="mt-6 text-foreground-muted text-sm leading-relaxed space-y-4 max-w-[56ch]">
              <p>
                Nico is a former Army physical training instructor with experience coaching, competing and building hybrid performance.
              </p>
              <p>
                SEVEN3SEVEN was shaped through practical training, competition preparation and the belief that effective programming should be clear enough to follow and strong enough to produce results.
              </p>
            </div>
            <p className="font-display text-bone mt-8">Nico</p>
            <p className="eyebrow">Founder, SEVEN3SEVEN</p>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow text-signal mb-4">Our mission</p>
            <h2 className="font-display font-bold text-bone text-3xl md:text-5xl tracking-tight leading-[1]">
              WE BUILD PROGRAMMES
              <br />
              THAT PREPARE YOU FOR
              <br />
              WHAT'S NEXT.
            </h2>
            <p className="text-foreground-muted text-sm mt-6 max-w-[58ch] leading-relaxed">
              Whether you're training for a competition, building your engine or starting your journey, SEVEN3SEVEN gives you the structure, guidance and tools to progress with confidence.
            </p>
            <p className="text-bone text-sm mt-3">You bring the work. We'll build the plan.</p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 h-12 px-6 bg-signal text-bone font-display uppercase text-xs tracking-[0.18em] hover:bg-signal/90 transition-colors rounded-[2px]"
            >
              Explore programmes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-border p-6 rounded-[2px]">
      <div className="text-signal mb-4">{icon}</div>
      <p className="font-display text-bone uppercase tracking-[0.12em] text-sm">{title}</p>
      <p className="text-foreground-muted text-xs mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
