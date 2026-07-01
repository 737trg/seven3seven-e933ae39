import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import nicoAsset from "@/assets/nico-rope.png.asset.json";
import { useAuth } from "@/lib/useAuth";

const SITE = "https://seven3seven.lovable.app";

export const Route = createFileRoute("/_marketing/about")({
  head: () => ({
    meta: [
      { title: "About SEVEN3SEVEN | Hybrid Fitness & Performance" },
      {
        name: "description",
        content:
          "Discover the story behind SEVEN3SEVEN, founded by former British Army Physical Training Instructor Nico and built around consistency, discipline and mindset.",
      },
      { property: "og:title", content: "The Story Behind SEVEN3SEVEN" },
      {
        property: "og:description",
        content:
          "Built from identity. Turned into purpose. Hybrid fitness and performance programmes designed to help people become more capable.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/about` },
      { property: "og:image", content: `${SITE}${nicoAsset.url}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}${nicoAsset.url}` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { user } = useAuth();

  return (
    <>
      {/* HERO */}
      <section className="bg-background border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 pt-16 md:pt-24 lg:pt-32 pb-20 md:pb-28 lg:pb-32">
          <p className="eyebrow text-foreground-muted mb-8">About SEVEN3SEVEN</p>
          <h1 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.88] uppercase text-[clamp(2.75rem,8vw,6.5rem)] max-w-[16ch]">
            Built from identity.
            <br />
            <span className="text-foreground-muted">Turned into purpose.</span>
          </h1>
          <div className="mt-12 md:mt-16 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 lg:col-start-2 text-bone/85 text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>737 were the final three digits of my Army number.</p>
              <p>For twelve years, that number formed part of my identity.</p>
              <p>Today, it represents something bigger.</p>
              <p>SEVEN3SEVEN is a hybrid performance brand built around three principles:</p>
              <p className="font-display uppercase text-bone tracking-tight text-2xl md:text-3xl leading-tight pt-2">
                Consistency. Discipline. Mindset.
              </p>
              <p>Not perfection.</p>
              <p>Not motivation when it feels easy.</p>
              <p>
                The standards required to keep showing up, keep progressing and become more capable
                over time.
              </p>
            </div>
          </div>
          <p className="mt-16 md:mt-20 font-display uppercase text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3.5vw,2.75rem)] max-w-[28ch]">
            The number came from service.
            <br />
            <span className="text-foreground-muted">The purpose came from experience.</span>
          </p>
        </div>
      </section>

      {/* ORIGIN */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">The Origin</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5.5vw,4.5rem)] max-w-[20ch]">
              The name was never random.
            </h2>
            <div className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>737 was originally part of who I was while serving in the British Army.</p>
              <p>
                When I began building my own coaching brand, those numbers carried more meaning than
                a name created for marketing ever could.
              </p>
              <p>They represented the experiences, standards and lessons that shaped me.</p>
              <p>The original 737 Training brand was built around:</p>
            </div>

            <dl className="mt-12 grid md:grid-cols-3 gap-10 md:gap-6 max-w-4xl">
              {[
                { h: "Consistency", b: "Doing the work often enough for it to matter." },
                { h: "Discipline", b: "Following the plan when motivation disappears." },
                { h: "Mindset", b: "Responding to setbacks, pressure and discomfort with intent." },
              ].map((p) => (
                <div key={p.h} className="border-t border-border/60 pt-5">
                  <dt className="font-display uppercase text-bone text-lg tracking-tight">{p.h}</dt>
                  <dd className="text-foreground-muted text-sm mt-3 leading-[1.6]">{p.b}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>SEVEN3SEVEN Hybrid Performance is the next evolution of that same brand.</p>
              <p>A new identity. A cleaner platform. A more complete training experience.</p>
              <p>The principles have not changed.</p>
            </div>

            <p className="mt-16 font-display uppercase text-bone tracking-[-0.02em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[16ch]">
              Fresh look.
              <br />
              <span className="text-foreground-muted">Same standard.</span>
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">The Philosophy</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5.5vw,4.5rem)] max-w-[20ch]">
              Capability over specialisation.
            </h2>
            <div className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>SEVEN3SEVEN is built around complete physical capability.</p>
              <p>Strength without an engine is incomplete.</p>
              <p>Endurance without resilience has limits.</p>
              <p>Conditioning without structure becomes random work.</p>
              <p>
                The goal is to create athletes and everyday people who can lift, run, move, recover
                and continue performing when the work becomes uncomfortable.
              </p>
              <p>That does not mean every person needs to become elite.</p>
              <p>
                It means every person deserves a programme that helps them become as capable as
                their current ability, circumstances and commitment allow.
              </p>
            </div>

            <ol className="mt-14 space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-10">
              {[
                { n: "01", h: "Strength", b: "Build the capacity to produce force, control your body and handle demanding work." },
                { n: "02", h: "Endurance", b: "Develop the engine to sustain effort, recover and repeat performance." },
                { n: "03", h: "Conditioning", b: "Learn to combine strength and endurance without allowing movement quality or decision-making to disappear." },
              ].map((p) => (
                <li key={p.n} className="border-t border-border/60 pt-5">
                  <p className="eyebrow text-signal">{p.n}</p>
                  <p className="font-display uppercase text-bone text-xl tracking-tight mt-3">{p.h}</p>
                  <p className="text-foreground-muted text-sm mt-3 leading-[1.6]">{p.b}</p>
                </li>
              ))}
            </ol>

            <p className="mt-16 font-display uppercase text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3.5vw,2.5rem)]">
              Balanced. <span className="text-foreground-muted">Measurable. Repeatable.</span>
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <img
              src={nicoAsset.url}
              alt="Nico, founder of SEVEN3SEVEN"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-6 lg:pt-8">
            <p className="eyebrow mb-6">Founder</p>
            <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.9] uppercase text-[clamp(3rem,7vw,6rem)]">
              Nico.
            </h2>
            <p className="mt-6 font-display uppercase text-bone tracking-tight text-xl md:text-2xl leading-[1.15]">
              Soldier. <span className="text-foreground-muted">Coach. Athlete.</span>
            </p>
            <div className="mt-10 text-foreground-muted text-base leading-[1.65] space-y-5 max-w-[52ch]">
              <p>
                I served for twelve years in the British Army with 4th Regiment Royal Artillery as
                part of a Fire Support Team.
              </p>
              <p>
                In December 2017, I completed the All Arms Physical Training Instructor Course.
              </p>
              <p>
                That role gave me the opportunity to lead physical training, coach soldiers and
                understand the difference between simply making a session difficult and programming
                training that genuinely prepares someone to perform.
              </p>
              <p>Sport and fitness had already been part of my life long before that.</p>
              <p>
                I studied Physical Education at GCSE and A level, represented Warwickshire as a
                young athlete and was scouted for the Scottish Exiles pathway before choosing a
                career in the British Army.
              </p>
              <p>Today, I am a qualified coach, hybrid athlete and competitor.</p>
              <p>But I was not born exceptionally strong or fit.</p>
              <p className="text-bone font-display uppercase text-2xl tracking-tight pt-2">
                I built it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FACT STRIP */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-20 grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
          {[
            { k: "12 Years", v: "British Army service" },
            { k: "2017", v: "All Arms Physical Training Instructor" },
            { k: "£4,000+", v: "Raised for men's mental-health causes" },
            { k: "3 Principles", v: "Consistency · Discipline · Mindset" },
          ].map((f, i) => (
            <div
              key={f.k}
              className={`py-6 md:py-2 ${i === 0 ? "md:pl-0" : "md:pl-8"} ${i === 3 ? "md:pr-0" : "md:pr-8"}`}
            >
              <p className="font-display uppercase text-bone tracking-tight text-2xl md:text-3xl leading-[1]">
                {f.k}
              </p>
              <p className="eyebrow text-foreground-muted mt-3">{f.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BUILT NOT BORN */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">The Personal Story</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5vw,4rem)] max-w-[22ch]">
              I was never the strongest person in the room.
              <br />
              <span className="text-foreground-muted">I learned how to keep turning up.</span>
            </h2>
            <div className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>I have always been naturally slim.</p>
              <p>Strength did not come easily.</p>
              <p>
                Fitness was something that had to be developed, lost, rebuilt and tested repeatedly.
              </p>
              <p>
                The Army taught me resilience, responsibility and the importance of performing as
                part of a team.
              </p>
              <p>Life outside the Army added different lessons.</p>
              <p className="font-display uppercase text-bone tracking-tight text-lg pt-2">
                Setbacks. Loss. Pressure. Failure. Starting again.
              </p>
              <p>Over time, those experiences built more than physical fitness.</p>
              <p>They shaped the way I lead, coach and approach difficult situations.</p>
              <p>I try to lead by example.</p>
              <p>To set the standard for the people beside me.</p>
              <p>
                Not by pretending to have everything figured out, but by continuing to show up and
                do the work myself.
              </p>
            </div>
            <p className="mt-16 font-display uppercase text-bone tracking-[-0.02em] leading-[0.95] text-[clamp(2rem,5vw,4rem)] max-w-[22ch]">
              You do not need to begin as the finished product.
              <br />
              <span className="text-foreground-muted">You need to begin.</span>
            </p>
          </div>
        </div>
      </section>

      {/* COACHING */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">The Coaching Standard</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5vw,4rem)] max-w-[22ch]">
              Clear enough to follow.
              <br />
              <span className="text-foreground-muted">Strong enough to produce results.</span>
            </h2>
            <div className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>Training should challenge people.</p>
              <p>It should also make sense.</p>
              <p>
                Every SEVEN3SEVEN programme is built around progression, purpose and honest
                feedback.
              </p>
              <p>
                We use tools such as RPE, scalable movement options, performance tracking and
                readiness adjustments because every person starts from a different place.
              </p>
              <p>The programme should meet the athlete where they are.</p>
              <p>It should not leave them there.</p>
            </div>

            <ol className="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-10">
              {[
                {
                  n: "01",
                  h: "Purpose before punishment",
                  b: "A session is not effective simply because it leaves someone on the floor.",
                },
                {
                  n: "02",
                  h: "Progress before ego",
                  b: "Training loads, paces and movement difficulty should be earned.",
                },
                {
                  n: "03",
                  h: "Standards before shortcuts",
                  b: "Legal repetitions, repeatable output and consistent execution matter.",
                },
                {
                  n: "04",
                  h: "The person before the spreadsheet",
                  b: "Work, family, recovery, training experience and real life all affect performance.",
                },
              ].map((p) => (
                <li key={p.n} className="border-t border-border/60 pt-5">
                  <p className="eyebrow text-signal">{p.n}</p>
                  <p className="font-display uppercase text-bone text-xl tracking-tight mt-3">
                    {p.h}
                  </p>
                  <p className="text-foreground-muted text-sm mt-3 leading-[1.6] max-w-[42ch]">
                    {p.b}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-16 font-display uppercase text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3.5vw,2.5rem)] max-w-[26ch]">
              The plan provides the structure.
              <br />
              <span className="text-foreground-muted">The athlete provides the work.</span>
            </p>
          </div>
        </div>
      </section>

      {/* MENTAL HEALTH */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">More Than Physical Fitness</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5vw,4rem)] max-w-[22ch]">
              Fitness can change more than your body.
            </h2>
            <div className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>I am a strong advocate for men's mental health.</p>
              <p>
                Over the years, I have helped raise more than £4,000 for causes including Movember
                and, most recently, REORG.
              </p>
              <p>
                That support matters because fitness has never only been about appearance or
                competition.
              </p>
              <p>Training can create routine when life feels chaotic.</p>
              <p>It can provide community when someone feels isolated.</p>
              <p>It can rebuild confidence after difficult periods.</p>
              <p>It can give people somewhere productive to place their energy.</p>
              <p>Fitness is not a replacement for professional mental-health support.</p>
              <p>
                But for many people, it can become an important part of managing life, rebuilding
                identity and moving forward.
              </p>
            </div>
            <p className="mt-16 font-display uppercase text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.75rem,4vw,3rem)] max-w-[26ch]">
              Stronger physically.
              <br />
              <span className="text-foreground-muted">More resilient mentally.</span>
              <br />
              <span className="text-signal">Never afraid to ask for help.</span>
            </p>
          </div>
        </div>
      </section>

      {/* WHO WE BUILD FOR */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">Who We Build For</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5vw,4rem)] max-w-[20ch]">
              Programmes with a purpose.
            </h2>
            <p className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] max-w-[58ch]">
              SEVEN3SEVEN is for people working towards something real.
            </p>

            <dl className="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-10">
              {[
                {
                  h: "The Applicant",
                  b: "Preparing for military or emergency-service training and wanting to arrive ready for the demands ahead.",
                },
                {
                  h: "The Competitor",
                  b: "Preparing for a hybrid event and needing a structured plan rather than random workouts.",
                },
                {
                  h: "The Athlete",
                  b: "Wanting to become stronger, fitter and more complete without choosing between lifting and endurance.",
                },
                {
                  h: "The Person Starting Again",
                  b: "Rebuilding routine, confidence and physical capability after time away from training.",
                },
              ].map((p) => (
                <div key={p.h} className="border-t border-border/60 pt-5">
                  <dt className="font-display uppercase text-bone text-xl tracking-tight">{p.h}</dt>
                  <dd className="text-foreground-muted text-sm mt-3 leading-[1.6] max-w-[44ch]">
                    {p.b}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-14 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-3 max-w-[58ch]">
              <p>Different goals.</p>
              <p>Different starting points.</p>
              <p>The same expectation:</p>
              <p className="font-display uppercase text-bone tracking-tight text-xl pt-2">
                Follow the plan. Record the work. Keep progressing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">The Next Version</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5vw,4rem)] max-w-[22ch]">
              Built to be used.
              <br />
              <span className="text-foreground-muted">Not downloaded and forgotten.</span>
            </h2>
            <div className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] space-y-5 max-w-[58ch]">
              <p>
                Traditional programmes are often delivered as a PDF and left inside a downloads
                folder.
              </p>
              <p>SEVEN3SEVEN programmes are designed as complete interactive training systems.</p>
              <p>Customers can:</p>
            </div>
            <ul className="mt-8 max-w-[58ch] divide-y divide-border/60 border-y border-border/60">
              {[
                "Follow the current session",
                "Use built-in timers",
                "Record loads, repetitions and results",
                "Track genuine progress",
                "Adjust sessions using coach-written readiness guidance",
                "Learn movement standards and training terminology",
                "Prepare Race Day or Assessment Day plans",
                "Use programme-specific calculators",
                "Keep the permanent PDF for future reference",
              ].map((f) => (
                <li key={f} className="py-4 text-bone/90 text-sm md:text-base flex gap-4">
                  <span className="text-signal font-display text-xs pt-1">—</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-16 font-display uppercase text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.5rem,3.5vw,2.5rem)]">
              The PDF is included.{" "}
              <span className="text-foreground-muted">The experience goes further.</span>
            </p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <p className="eyebrow mb-10">The Three Principles</p>
          <div className="space-y-16 md:space-y-24">
            {[
              {
                h: "Consistency.",
                b: "One great session changes very little. Repeated good sessions change almost everything.",
              },
              {
                h: "Discipline.",
                b: "The ability to follow the plan when motivation is absent.",
              },
              {
                h: "Mindset.",
                b: "The response to discomfort, pressure, failure and the decision to continue.",
              },
            ].map((p) => (
              <div
                key={p.h}
                className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-baseline border-t border-border/60 pt-10"
              >
                <h3 className="lg:col-span-6 font-display font-bold text-bone tracking-[-0.03em] leading-[0.9] uppercase text-[clamp(3rem,8vw,7rem)]">
                  {p.h}
                </h3>
                <p className="lg:col-span-5 lg:col-start-8 text-foreground-muted text-lg md:text-xl leading-[1.5]">
                  {p.b}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-20 md:mt-28 font-display uppercase text-bone tracking-[-0.02em] leading-[1] text-[clamp(1.75rem,4vw,3rem)] max-w-[26ch]">
            Seven days.{" "}
            <span className="text-foreground-muted">Three principles. Seven opportunities.</span>
          </p>
        </div>
      </section>

      {/* INDEPENDENT NOTE */}
      <section className="border-b border-border/60">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 lg:py-32 grid lg:grid-cols-12 gap-10">
          <p className="eyebrow lg:col-span-2">Independently Built</p>
          <div className="lg:col-span-10">
            <h2 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.95] uppercase text-[clamp(2rem,5vw,3.5rem)] max-w-[22ch]">
              Experience informed.
              <br />
              <span className="text-foreground-muted">Evidence led.</span>
            </h2>
            <div className="mt-10 text-foreground-muted text-sm md:text-base leading-[1.65] space-y-5 max-w-[58ch]">
              <p>SEVEN3SEVEN is an independent coaching and performance brand.</p>
              <p>
                The programmes are informed by practical coaching, military physical training,
                competition experience and current training evidence.
              </p>
              <p>
                Where a programme prepares customers for an external organisation or event, it
                remains independent unless explicitly stated otherwise.
              </p>
              <p>
                SEVEN3SEVEN is not the British Army, HYROX, ATHX, Hybrid Games or any other event
                organiser.
              </p>
              <p>
                Customers should always confirm current official standards, rules and event details
                with the relevant organisation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-28 lg:py-40">
          <p className="eyebrow text-signal mb-8">SEVEN3SEVEN</p>
          <h2 className="font-display font-bold text-bone tracking-[-0.03em] leading-[0.88] uppercase text-[clamp(2.75rem,8vw,6.5rem)] max-w-[18ch]">
            You bring the work.
            <br />
            <span className="text-foreground-muted">We'll build the plan.</span>
          </h2>
          <p className="mt-10 text-foreground-muted text-base md:text-lg leading-[1.65] max-w-[58ch]">
            Whether you are preparing to serve, preparing to compete or simply trying to become more
            capable, the principle remains the same.
          </p>
          <div className="mt-6 text-bone text-base md:text-lg leading-[1.65] max-w-[58ch] space-y-2">
            <p>Start from where you are.</p>
            <p>Follow the process.</p>
            <p>Build something that lasts.</p>
          </div>
          <div className="mt-14 flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link
              to="/programmes"
              className="h-12 px-8 inline-flex items-center justify-center gap-3 bg-bone text-obsidian text-[11px] uppercase tracking-[0.28em] font-display"
            >
              Explore programmes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {user && (
              <Link
                to="/my-programmes"
                className="h-12 px-8 inline-flex items-center justify-center gap-3 border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display hover:border-bone transition-colors"
              >
                My programmes <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}