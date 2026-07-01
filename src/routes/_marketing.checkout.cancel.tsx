import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/checkout/cancel")({
  head: () => ({
    meta: [
      { title: "Checkout cancelled — SEVEN3SEVEN" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CancelPage,
});

function CancelPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-12 py-24 lg:py-32 text-center space-y-8">
      <p className="eyebrow">Order</p>
      <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl tracking-[-0.03em] leading-[0.95]">
        Checkout cancelled
      </h1>
      <p className="text-foreground-muted">Your cart is still saved. You can complete your purchase whenever you&rsquo;re ready.</p>
      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/cart" className="bg-bone text-obsidian uppercase tracking-[0.22em] text-xs px-8 py-4 font-medium">
          Return to cart
        </Link>
        <Link to="/programmes" className="text-bone uppercase tracking-[0.22em] text-xs border border-bone/40 px-8 py-4">
          Keep browsing
        </Link>
      </div>
    </div>
  );
}