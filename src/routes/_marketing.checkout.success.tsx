import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cart } from "@/lib/cart";
import { confirmCheckoutFulfilment } from "@/lib/checkout.functions";
import { syncMyMembership } from "@/lib/membership.functions";
import { getStripeEnvironment } from "@/lib/stripe";

type Search = { session_id?: string };

export const Route = createFileRoute("/_marketing/checkout/success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment complete — SEVEN3SEVEN" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id } = Route.useSearch();
  const [status, setStatus] = useState<"pending" | "ready" | "failed">("pending");
  const [slugs, setSlugs] = useState<string[]>([]);
  const [isMembership, setIsMembership] = useState(false);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!session_id) {
      setStatus("failed");
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const environment = getStripeEnvironment();

    async function poll() {
      attempts += 1;
      try {
        const res = await confirmCheckoutFulfilment({ data: { sessionId: session_id!, environment } });
        if (cancelled) return;
        if ("ready" in res && res.ready) {
          setSlugs(res.slugs);
          setStatus("ready");
          if (!clearedRef.current) {
            clearedRef.current = true;
            cart.clear();
          }
          return;
        }
        // A subscription checkout carries no product slugs — confirm the
        // membership instead.
        if ("slugs" in res && res.slugs.length === 0) {
          const m = await syncMyMembership({ data: { environment } });
          if (cancelled) return;
          if (m.ok && m.active) {
            setIsMembership(true);
            setStatus("ready");
            return;
          }
        }
      } catch {
        /* ignore transient */
      }
      if (attempts >= 20) {
        setStatus("failed");
        return;
      }
      setTimeout(poll, 1500);
    }
    poll();
    return () => { cancelled = true; };
  }, [session_id]);

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-12 py-24 lg:py-32 text-center space-y-8">
      <p className="eyebrow">Order</p>
      <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl tracking-[-0.03em] leading-[0.95]">
        {status === "ready" ? "Welcome in." : status === "failed" ? "Something went wrong" : "Confirming your order…"}
      </h1>
      {status === "pending" && (
        <p className="text-foreground-muted">Your payment succeeded. We&rsquo;re unlocking your programme now — this usually takes a few seconds.</p>
      )}
      {status === "ready" && (
        <>
          <p className="text-foreground-muted">
            {isMembership
              ? "Your SEVEN3SEVEN Club membership is live. Every programme is unlocked."
              : slugs.length > 1
                ? "Your programmes are ready."
                : "Your programme is ready."}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/my-programmes" className="bg-bone text-obsidian uppercase tracking-[0.22em] text-xs px-8 py-4 font-medium">
              Go to my programmes
            </Link>
            <Link to="/programmes" className="text-bone uppercase tracking-[0.22em] text-xs border border-bone/40 px-8 py-4">
              Continue browsing
            </Link>
          </div>
        </>
      )}
      {status === "failed" && (
        <>
          <p className="text-foreground-muted">If you were charged, your programme will appear in your library shortly. Please refresh in a minute or contact support.</p>
          <Link to="/my-programmes" className="inline-block bg-bone text-obsidian uppercase tracking-[0.22em] text-xs px-8 py-4">
            Check my programmes
          </Link>
        </>
      )}
    </div>
  );
}