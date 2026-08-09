import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from '@/lib/stripe.server';

type CheckoutInput = {
  slugs: string[]; // canonical product slugs
  returnUrl: string;
  cancelUrl: string;
  environment: StripeEnv;
};

type CheckoutResult =
  | { clientSecret?: string; url?: string; sessionId: string; ownedRemoved: string[] }
  | { error: string }
  | { redirect: 'my-programmes'; ownedRemoved: string[] };

// Slug → Stripe price lookup_key. Kept in server code so the browser cannot
// substitute a different price or product.
const SLUG_TO_LOOKUP: Record<string, string> = {
  'basic-training-blueprint-plus': 'basic_training_blueprint_plus_lifetime',
  'sem-2026': 'sem_2026_lifetime',
  'sem-2027': 'sem_2027_lifetime',
  'hybrid-race-plan': 'hybrid_race_plan_lifetime',
  mixed: 'mixed_lifetime',
  'build-total': 'build_total_lifetime',
};

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  opts: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(opts.userId)) throw new Error('Invalid userId');
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${opts.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;
  if (opts.email) {
    const existing = await stripe.customers.list({ email: opts.email, limit: 1 });
    if (existing.data.length) {
      const c = existing.data[0];
      if (c.metadata?.userId !== opts.userId) {
        await stripe.customers.update(c.id, {
          metadata: { ...c.metadata, userId: opts.userId },
        });
      }
      return c.id;
    }
  }
  const created = await stripe.customers.create({
    ...(opts.email && { email: opts.email }),
    metadata: { userId: opts.userId },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CheckoutInput) => {
    if (!Array.isArray(data.slugs) || data.slugs.length === 0) throw new Error('Empty cart');
    for (const s of data.slugs) {
      if (!SLUG_TO_LOOKUP[s]) throw new Error(`Unknown product: ${s}`);
    }
    if (typeof data.returnUrl !== 'string' || !data.returnUrl.startsWith('http')) throw new Error('Invalid returnUrl');
    if (typeof data.cancelUrl !== 'string' || !data.cancelUrl.startsWith('http')) throw new Error('Invalid cancelUrl');
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { supabase, userId } = context;
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? undefined;

      // Resolve canonical products server-side. Never trust prices from the client.
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, slug, name, price_cents')
        .in('slug', data.slugs);
      if (prodErr || !products) throw new Error('Product lookup failed');

      // Filter out already-owned products
      const ownedRemoved: string[] = [];
      const purchasable: typeof products = [];
      for (const p of products) {
        const { data: hasIt } = await supabase.rpc('user_has_entitlement', {
          _user_id: userId,
          _product_id: p.id,
        });
        if (hasIt) ownedRemoved.push(p.slug);
        else purchasable.push(p);
      }
      if (purchasable.length === 0) {
        return { redirect: 'my-programmes', ownedRemoved };
      }

      const stripe = createStripeClient(data.environment);

      // Resolve Stripe prices via lookup_keys (stable across sandbox and live)
      const lookups = purchasable.map((p) => SLUG_TO_LOOKUP[p.slug]);
      const priceList = await stripe.prices.list({ lookup_keys: lookups, active: true, limit: 10 });
      const priceByLookup = new Map<string, (typeof priceList.data)[number]>();
      for (const price of priceList.data) {
        if (price.lookup_key) priceByLookup.set(price.lookup_key, price);
      }
      const lineItems = purchasable.map((p) => {
        const price = priceByLookup.get(SLUG_TO_LOOKUP[p.slug]);
        if (!price) throw new Error(`Missing Stripe price for ${p.slug}`);
        return { price: price.id, quantity: 1 };
      });

      const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        customer: customerId,
        allow_promotion_codes: true,
        success_url: `${data.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.cancelUrl,
        payment_intent_data: {
          description: purchasable.map((p) => p.name).join(' + '),
        },
        metadata: {
          userId,
          product_slugs: purchasable.map((p) => p.slug).join(','),
          product_ids: purchasable.map((p) => p.id).join(','),
        },
      });

      return {
        sessionId: session.id,
        url: session.url ?? undefined,
        ownedRemoved,
      };
    } catch (error) {
      console.error('createCheckoutSession error:', error);
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Poll target: returns whether the signed-in user now owns all the products from the session's metadata. */
export const confirmCheckoutFulfilment = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error('Invalid sessionId');
    return data;
  })
  .handler(async ({ data, context }) => {
    try {
      const { supabase, userId } = context;
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      const slugs = (session.metadata?.product_slugs ?? '').split(',').filter(Boolean);
      if (slugs.length === 0) return { ready: false, slugs: [] as string[], paid: false };

      const paid = session.status === 'complete' && (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');

      // Only the buyer can self-fulfil their own session.
      const sessionUserId = session.metadata?.userId;
      if (paid && sessionUserId === userId) {
        const { data: products } = await supabase
          .from('products')
          .select('id, slug')
          .in('slug', slugs);
        let missing = false;
        for (const p of products ?? []) {
          const { data: hasIt } = await supabase.rpc('user_has_entitlement', {
            _user_id: userId,
            _product_id: p.id,
          });
          if (!hasIt) { missing = true; break; }
        }
        // Webhook hasn't landed yet (or never will). Fulfil directly — idempotent.
        if (missing) {
          const { fulfilCheckoutSession } = await import('@/lib/fulfilment.server');
          try { await fulfilCheckoutSession(data.sessionId, data.environment); }
          catch (e) { console.error('Self-heal fulfilment failed', e); }
        }
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, slug')
        .in('slug', slugs);
      if (!products) return { ready: false, slugs, paid };

      let allOwned = true;
      for (const p of products) {
        const { data: hasIt } = await supabase.rpc('user_has_entitlement', {
          _user_id: userId,
          _product_id: p.id,
        });
        if (!hasIt) allOwned = false;
      }
      return { ready: paid && allOwned, slugs, paid };
    } catch (error) {
      return { ready: false, slugs: [] as string[], paid: false, error: getStripeErrorMessage(error) };
    }
  });

/**
 * Called from the customer's library page — scans their Stripe customer
 * record for any complete-but-unfulfilled checkout sessions and grants
 * entitlements. Safety net for webhook drops and voucher redemptions that
 * closed the browser before the success page finished polling.
 */
export const recoverPendingPurchases = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { recoverPendingPurchasesForUser } = await import('@/lib/fulfilment.server');
      const fulfilled = await recoverPendingPurchasesForUser(context.userId, data.environment);
      return { ok: true, fulfilled };
    } catch (error) {
      return { ok: false, fulfilled: [] as string[], error: getStripeErrorMessage(error) };
    }
  });

/**
 * Idempotent bootstrap that ensures the two required Stripe coupons +
 * promotion codes exist. Safe to call multiple times. Owner-only.
 */
export const ensurePromotionCodes = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }) => {
    try {
      // Owner/admin only — this mutates live Stripe coupons & promo codes.
      const { data: isStaff, error: staffErr } = await context.supabase.rpc('is_staff', {
        _user_id: context.userId,
      });
      if (staffErr || !isStaff) return { ok: false, error: 'Forbidden: staff only' };

      const stripe = createStripeClient(data.environment);

      async function ensureCoupon(id: string, percent_off: number, name: string) {
        try {
          return await stripe.coupons.retrieve(id);
        } catch {
          return await stripe.coupons.create({ id, percent_off, duration: 'once', name });
        }
      }
      async function ensurePromo(code: string, couponId: string) {
        const existing = await stripe.promotionCodes.list({ code, limit: 1 });
        if (existing.data.length) return existing.data[0];
        return await stripe.promotionCodes.create({
          code,
          promotion: { type: 'coupon', coupon: couponId },
          restrictions: { first_time_transaction: false },
        });
      }

      const c15 = await ensureCoupon('founder15', 15, 'Founder 15');
      const c100 = await ensureCoupon('seven3seven100', 100, 'Seven3Seven 100');
      const p15 = await ensurePromo('Founder15', c15.id);
      const p100 = await ensurePromo('Seven3Seven100', c100.id);

      return { ok: true, founder15: p15.code, seven3seven100: p100.code };
    } catch (error) {
      return { ok: false, error: getStripeErrorMessage(error) };
    }
  });