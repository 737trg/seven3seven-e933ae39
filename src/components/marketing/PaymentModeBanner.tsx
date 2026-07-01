import { isSandboxPayments } from "@/lib/stripe";

/**
 * Renders a compact "Test mode" strip above the cart / checkout pages so it
 * is unambiguous which environment a shopper is transacting in. Hidden
 * automatically in live.
 */
export function PaymentModeBanner() {
  if (!isSandboxPayments()) return null;
  return (
    <div className="bg-signal/15 border-b border-signal/30 text-signal">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-2 text-[10px] uppercase tracking-[0.22em] flex items-center gap-3">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
        Test mode — use Stripe test card 4242 4242 4242 4242
      </div>
    </div>
  );
}