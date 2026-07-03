/**
 * Client-side payment helpers.
 *
 * We use Stripe Checkout in redirect mode (no Stripe.js needed on the client),
 * so the browser never handles secret keys. The environment is a fixed
 * build-time constant: `sandbox` today; switch to `live` once the live
 * Stripe key is connected in Lovable Cloud.
 */
export type StripeEnv = 'sandbox' | 'live';

// Derive environment from the publishable token prefix — the source of
// truth Vite loads per-mode from .env.development / .env.production.
// pk_live_… → live, pk_test_… → sandbox. Never silently default to live.
const CLIENT_TOKEN = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function getStripeEnvironment(): StripeEnv {
  if (CLIENT_TOKEN?.startsWith('pk_live_')) return 'live';
  if (CLIENT_TOKEN?.startsWith('pk_test_')) return 'sandbox';
  throw new Error(
    'Stripe payments are not configured for this build. ' +
    'Complete Stripe go-live to enable production checkout.',
  );
}

export function isSandboxPayments(): boolean {
  return getStripeEnvironment() === 'sandbox';
}