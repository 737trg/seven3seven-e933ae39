import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useMembership } from "@/lib/useMembership";
import { createMembershipCheckout, createMembershipPortal } from "@/lib/membership.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { CART_CATALOG } from "@/lib/cart";

/** Lowest one-off programme price, read from the live catalogue so it can't drift. */
const FROM_PRICE = `£${(
  Math.min(...Object.values(CART_CATALOG).map((p) => p.pricePence)) / 100
).toFixed(2)}`;

const CANONICAL = "https://737trg.com/pricing";

export const Route = createFileRoute("/_marketing/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SEVEN3SEVEN Club membership or one-off plans" },
      {
        name: "description",
        content:
          "Train with SEVEN3SEVEN: £14.99/month for every programme and the full coaching toolkit, or buy a single programme outright and keep it for life.",
      },
      { property: "og:title", content: "Pricing — SEVEN3SEVEN" },
      {
        property: "og:description",
        content: "Club membership at £14.99/month, or one-off programmes you own for life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: PricingPage,
});

const CLUB_FEATURES = [
  "Every programme, current and future, while you're a member",
  "Adaptive coaching: readiness check and load suggestions",
  "PB tracking, PB trends and strength standards",
  "Body metrics log and trends",
  "Monthly consistency leaderboard",
  "Schedule controls: move, swap or skip training days",
];

const PAYG_FEATURES = [
  "The programme you buy, yours for life",
  "Full interactive session runner with timers",
  "Set, rep and load logging",
  "Session and programme progress tracking",
  "The permanent PDF of your programme",
];

function PricingPage() {
  const { user } = useAuth();
  const membership = useMembership(user?.id);
  const navigate = useNavigate();
  const startCheckout = useServerFn(createMembershipCheckout);
  const openPortal = useServerFn(createMembershipPortal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    if (!user) { void navigate({ to: "/sign-in" }); return; }
    setError(null);
    setBusy(true);
    try {
      const origin = window.location.origin;
      const result = await startCheckout({
        data: {
          returnUrl: `${origin}/checkout/success`,
          cancelUrl: `${origin}/pricing`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      if ("alreadyMember" in result) { void navigate({ to: "/my-programmes" }); return; }
      if (result.url) window.location.href = result.url;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function manage() {
    setError(null);
    setBusy(true);
    try {
      const result = await openPortal({
        data: { returnUrl: `${window.location.origin}/account`, environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="container-x max-w-[1200px] mx-auto pt-16 pb-10 lg:pt-24">
        <p className="eyebrow text-signal mb-4">Pricing</p>
        <h1 className="display-lg text-bone">Two ways to train.</h1>
        <p className="body-md mt-4 max-w-[60ch]">
          Join the SEVEN3SEVEN Club for everything we build, or buy a single programme outright and
          keep it forever. Both give you the full interactive app for what you train.
        </p>
      </section>

      <section className="container-x max-w-[1200px] mx-auto pb-20 grid gap-6 md:grid-cols-2">
        <div className="hairline elevated p-7 md:p-9 flex flex-col">
          <p className="eyebrow text-signal">Club membership</p>
          <p className="display-md text-bone mt-3">
            £14.99<span className="body-sm"> / month</span>
          </p>
          <p className="body-sm mt-3">Everything unlocked while you're a member. Cancel anytime.</p>
          <ul className="mt-7 space-y-3 flex-1">
            {CLUB_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-bone text-sm">
                <Check className="h-4 w-4 text-signal mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="body-sm mt-5 text-foreground-muted">
            Membership is app access. The permanent PDF stays with one-off purchases.
          </p>
          {membership.isMember ? (
            <button onClick={manage} disabled={busy} className="press mt-7 h-12 px-6 inline-flex items-center justify-center border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display">
              Manage membership
            </button>
          ) : membership.hasClubAccess ? (
            <div className="mt-7">
              <p className="eyebrow text-signal">You already have full access</p>
              <p className="body-sm mt-2">
                As a founding customer every Club feature is unlocked on your account, free.
              </p>
              <Link to="/my-programmes" className="press tap mt-4 h-12 px-6 inline-flex items-center justify-center border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display hover:border-bone">
                Go to dashboard
              </Link>
            </div>
          ) : (
            <button onClick={join} disabled={busy} className="press mt-7 h-12 px-6 inline-flex items-center justify-center bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display">
              {busy ? "Opening…" : "Join the Club"}
            </button>
          )}
        </div>

        <div className="hairline p-7 md:p-9 flex flex-col">
          <p className="eyebrow">One-off programme</p>
          <p className="display-md text-bone mt-3">
            From {FROM_PRICE}<span className="body-sm"> once</span>
          </p>
          <p className="body-sm mt-3">Buy a programme outright. It stays in your library for life.</p>
          <ul className="mt-7 space-y-3 flex-1">
            {PAYG_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-bone text-sm">
                <Check className="h-4 w-4 text-foreground-muted mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link to="/programmes" className="press mt-7 h-12 px-6 inline-flex items-center justify-center gap-2 border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display">
            Browse programmes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {error && (
        <p className="container-x max-w-[1200px] mx-auto pb-10 text-signal text-sm">{error}</p>
      )}

      <section className="container-x max-w-[900px] mx-auto pb-24">
        <p className="eyebrow mb-6">Common questions</p>
        <div className="space-y-6">
          <Faq q="What happens if I cancel my membership?">
            You keep access until the end of the month you've paid for. After that the Club
            programmes and Club features lock, and anything you bought outright stays yours.
          </Faq>
          <Faq q="Do members get the PDFs?">
            No. The permanent PDF is part of a one-off purchase. Membership is the guided app
            experience — every session, timer and tracker, always up to date.
          </Faq>
          <Faq q="I already bought a programme. Does anything change?">
            Nothing. Your programme is yours for life, and as an existing customer your coaching,
            PB and metrics tools stay unlocked for free.
          </Faq>
        </div>
      </section>
    </>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="hairline p-6">
      <p className="text-bone font-display uppercase tracking-[0.16em] text-sm">{q}</p>
      <p className="body-sm mt-3">{children}</p>
    </div>
  );
}