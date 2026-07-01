/**
 * Client-side payment helpers.
 *
 * We use Stripe Checkout in redirect mode (no Stripe.js needed on the client),
 * so the browser never handles secret keys. The environment is a fixed
 * build-time constant: `sandbox` today; switch to `live` once the live
 * Stripe key is connected in Lovable Cloud.
 */
export type StripeEnv = 'sandbox' | 'live';

const PAYMENTS_MODE = (import.meta.env.VITE_PAYMENTS_MODE as string | undefined) ?? 'sandbox';

export function getStripeEnvironment(): StripeEnv {
  return PAYMENTS_MODE === 'live' ? 'live' : 'sandbox';
}

export function isSandboxPayments(): boolean {
  return getStripeEnvironment() === 'sandbox';
}