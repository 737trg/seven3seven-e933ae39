import type Stripe from 'stripe';
import { type StripeEnv, createStripeClient } from '@/lib/stripe.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

/**
 * Idempotently fulfil a completed Stripe checkout session: writes the order,
 * order_items, and grants entitlements. Safe to call multiple times.
 * Returns true if the session was fulfilled (or already was), false if it is
 * not in a paid/complete state yet.
 */
export async function fulfilCheckoutSession(sessionId: string, env: StripeEnv, opts?: { overrideUserId?: string }): Promise<boolean> {
  const stripe = createStripeClient(env);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'total_details.breakdown', 'payment_intent'],
  });

  if (session.status !== 'complete') return false;
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return false;

  const userId = opts?.overrideUserId ?? session.metadata?.userId;
  const productSlugs = (session.metadata?.product_slugs ?? '').split(',').filter(Boolean);
  if (!userId || productSlugs.length === 0) {
    console.error('Fulfilment missing metadata', { sessionId, userId, productSlugs });
    return false;
  }

  const supabase = supabaseAdmin;
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, slug, price_cents')
    .in('slug', productSlugs);
  if (prodErr || !products || products.length === 0) throw new Error('Products not found');

  const { data: versions } = await supabase
    .from('programme_versions')
    .select('id, product_id')
    .in('product_id', products.map((p) => p.id))
    .eq('is_current', true);
  const versionByProduct = new Map<string, string>();
  for (const v of versions ?? []) versionByProduct.set(v.product_id, v.id);

  const subtotal = session.amount_subtotal ?? 0;
  const total = session.amount_total ?? 0;
  const discount = Math.max(0, subtotal - total);
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id ?? null;
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? null;

  let promotionCode: string | null = null;
  const discounts = (session as unknown as { discounts?: { promotion_code?: string | Stripe.PromotionCode | null }[] }).discounts;
  if (discounts && discounts.length > 0) {
    const pc = discounts[0].promotion_code;
    if (pc) {
      const pcId = typeof pc === 'string' ? pc : pc.id;
      try {
        const promo = await stripe.promotionCodes.retrieve(pcId);
        promotionCode = promo.code;
      } catch { /* ignore */ }
    }
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .upsert(
      {
        user_id: userId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        stripe_customer_id: customerId,
        subtotal_pence: subtotal,
        discount_pence: discount,
        total_pence: total,
        currency: (session.currency ?? 'gbp').toLowerCase(),
        promotion_code: promotionCode,
        payment_status: session.payment_status,
        order_status: 'completed',
        purchased_at: new Date().toISOString(),
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_checkout_session_id' },
    )
    .select('id')
    .single();
  if (orderErr || !order) throw new Error(`Order upsert failed: ${orderErr?.message}`);

  const perItemDiscount = products.length > 0 ? Math.floor(discount / products.length) : 0;
  for (const p of products) {
    const unit = (p.price_cents ?? 0) as number;
    const finalPrice = Math.max(0, unit - perItemDiscount);
    await supabase
      .from('order_items')
      .upsert(
        {
          order_id: order.id,
          product_id: p.id,
          programme_version_id: versionByProduct.get(p.id) ?? null,
          stripe_price_id: null,
          unit_price_pence: unit,
          discount_pence: perItemDiscount,
          final_price_pence: finalPrice,
        },
        { onConflict: 'order_id,product_id' },
      );

    const { data: existing } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', p.id)
      .is('revoked_at', null)
      .maybeSingle();
    if (!existing) {
      await supabase.from('entitlements').insert({
        user_id: userId,
        product_id: p.id,
        programme_version_id: versionByProduct.get(p.id) ?? null,
        source: 'purchase',
        order_id: order.id,
        granted_by: userId,
        metadata: { checkout_session_id: session.id, promotion_code: promotionCode },
      });
    } else {
      await supabase
        .from('entitlements')
        .update({ order_id: order.id, programme_version_id: versionByProduct.get(p.id) ?? null })
        .eq('id', existing.id);
    }
  }
  return true;
}

/**
 * Recover any complete-but-unfulfilled Stripe checkout sessions for a user.
 * Searches Stripe by customer metadata (userId) and fulfils sessions in
 * status=complete whose entitlements aren't yet granted. Returns the list of
 * session ids that were fulfilled during this call.
 */
export async function recoverPendingPurchasesForUser(userId: string, env: StripeEnv): Promise<string[]> {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) return [];
  const stripe = createStripeClient(env);
  const fulfilled: string[] = [];

  // Find Stripe customers linked to this app user.
  const customers = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 5,
  });
  if (customers.data.length === 0) return fulfilled;

  for (const customer of customers.data) {
    const sessions = await stripe.checkout.sessions.list({ customer: customer.id, limit: 20 });
    for (const session of sessions.data) {
      if (session.status !== 'complete') continue;
      if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') continue;
      if (session.metadata?.userId !== userId) continue;
      try {
        const did = await fulfilCheckoutSession(session.id, env);
        if (did) fulfilled.push(session.id);
      } catch (e) {
        console.error('Recovery fulfilment failed', { sessionId: session.id, error: (e as Error).message });
      }
    }
  }
  return fulfilled;
}