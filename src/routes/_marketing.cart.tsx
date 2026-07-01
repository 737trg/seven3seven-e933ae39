import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CART_CATALOG, cart, useCart } from "@/lib/cart";
import { createCheckoutSession } from "@/lib/checkout.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/lib/useAuth";
import { PaymentModeBanner } from "@/components/marketing/PaymentModeBanner";

export const Route = createFileRoute("/_marketing/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Cart — SEVEN3SEVEN" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function CartPage() {
  const state = useCart();
  const slugs = cart.slugs(state);
  const items = slugs.map((s) => CART_CATALOG[s]);
  const subtotal = items.reduce((n, i) => n + i.pricePence, 0);
  const auth = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setError(null);
    if (!auth.user) {
      nav({ to: "/sign-in", search: { redirect: "/cart" } as never });
      return;
    }
    setLoading(true);
    try {
      const environment = getStripeEnvironment();
      const origin = window.location.origin;
      const res = await createCheckoutSession({
        data: {
          slugs,
          environment,
          returnUrl: `${origin}/checkout/success`,
          cancelUrl: `${origin}/checkout/cancel`,
        },
      });
      if ("error" in res) {
        setError(res.error);
      } else if ("redirect" in res) {
        for (const s of res.ownedRemoved) cart.remove(s as never);
        nav({ to: "/my-programmes" });
      } else if (res.url) {
        for (const s of res.ownedRemoved) cart.remove(s as never);
        window.location.href = res.url;
      } else {
        setError("Checkout could not be started.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <PaymentModeBanner />
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
      <p className="eyebrow">Cart</p>
      <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl tracking-[-0.03em] leading-[0.95] mt-4">
        Your cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-16 border-t border-border/60 pt-16 text-center space-y-6">
          <p className="text-foreground-muted">Your cart is empty.</p>
          <Link to="/programmes" className="inline-block text-bone uppercase tracking-[0.22em] text-xs border border-bone/40 px-6 py-3 hover:bg-bone hover:text-obsidian transition">
            Browse programmes
          </Link>
        </div>
      ) : (
        <div className="mt-12 space-y-1">
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {items.map((i) => (
              <li key={i.slug} className="flex items-center justify-between py-6">
                <div>
                  <p className="text-bone font-display font-bold text-xl tracking-[-0.02em]">{i.title}</p>
                  <p className="text-foreground-muted text-xs uppercase tracking-[0.22em] mt-1">{i.durationLabel}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-bone tabular-nums">£{(i.pricePence / 100).toFixed(2)}</span>
                  <button
                    onClick={() => cart.remove(i.slug)}
                    className="text-foreground-muted text-[10px] uppercase tracking-[0.22em] hover:text-bone"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between py-6 border-b border-border/60">
            <span className="text-foreground-muted uppercase tracking-[0.22em] text-xs">Subtotal</span>
            <span className="text-bone text-2xl font-display font-bold tabular-nums">£{(subtotal / 100).toFixed(2)}</span>
          </div>
          <p className="text-foreground-muted text-xs mt-3">Promotion codes are entered on the next step, at checkout.</p>

          {error && (
            <p className="mt-4 text-signal text-sm border border-signal/40 bg-signal/10 px-4 py-3">{error}</p>
          )}

          <button
            onClick={checkout}
            disabled={loading || auth.loading}
            className="mt-8 w-full bg-bone text-obsidian uppercase tracking-[0.22em] text-xs py-5 font-medium hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting to secure checkout…" : "Proceed to checkout"}
          </button>
          <p className="text-foreground-muted text-[10px] uppercase tracking-[0.22em] text-center mt-4">
            Payments processed securely by Stripe
          </p>
        </div>
      )}
    </div>
    </>
  );
}