import type Stripe from 'stripe';
import { type StripeEnv, createStripeClient } from '@/lib/stripe.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

/** Stripe price lookup_key for the SEVEN3SEVEN Club membership. */
export const CLUB_PRICE_LOOKUP = 'club_monthly';

/** Personalised programmes that a membership never unlocks. */
const MEMBERSHIP_EXCLUDED_SLUGS = ['athx-2026'];

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

export function isSubscriptionActive(sub: { status: string; current_period_end?: number | null }): boolean {
  const endsInFuture = !sub.current_period_end || sub.current_period_end * 1000 > Date.now();
  if (ACTIVE_STATUSES.has(sub.status)) return endsInFuture;
  if (sub.status === 'canceled') return endsInFuture;
  return false;
}

/**
 * Grants (or revokes) membership entitlements for every published programme.
 * Membership entitlements are tagged `metadata.membership = true` so the PDF
 * download gate can exclude them — PDFs belong to one-off buyers only.
 */
export async function syncMembershipEntitlements(userId: string, active: boolean): Promise<void> {
  const supabase = supabaseAdmin;

  if (!active) {
    const { data: rows } = await supabase
      .from('entitlements')
      .select('id, metadata')
      .eq('user_id', userId)
      .is('revoked_at', null);
    const ids = (rows ?? [])
      .filter((r) => (r.metadata as Record<string, unknown> | null)?.membership === true)
      .map((r) => r.id);
    if (ids.length > 0) {
      await supabase
        .from('entitlements')
        .update({ revoked_at: new Date().toISOString() })
        .in('id', ids);
    }
    return;
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, slug')
    .eq('status', 'published');
  const eligible = (products ?? []).filter((p) => !MEMBERSHIP_EXCLUDED_SLUGS.includes(p.slug));
  if (eligible.length === 0) return;

  const { data: versions } = await supabase
    .from('programme_versions')
    .select('id, product_id')
    .in('product_id', eligible.map((p) => p.id))
    .eq('is_current', true);
  const versionByProduct = new Map<string, string>();
  for (const v of versions ?? []) versionByProduct.set(v.product_id, v.id);

  const { data: existing } = await supabase
    .from('entitlements')
    .select('id, product_id')
    .eq('user_id', userId)
    .is('revoked_at', null);
  const owned = new Set((existing ?? []).map((e) => e.product_id));

  const toInsert = eligible
    .filter((p) => !owned.has(p.id))
    .map((p) => ({
      user_id: userId,
      product_id: p.id,
      programme_version_id: versionByProduct.get(p.id) ?? null,
      source: 'gift' as const,
      granted_by: userId,
      metadata: { membership: true },
    }));
  if (toInsert.length > 0) {
    await supabase.from('entitlements').insert(toInsert);
  }
}

/** Mirrors a Stripe subscription into `public.subscriptions` and syncs access. */
export async function syncStripeSubscription(subscription: Stripe.Subscription, env: StripeEnv): Promise<void> {
  const supabase = supabaseAdmin;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  let userId = subscription.metadata?.userId ?? null;
  if (!userId) {
    try {
      const stripe = createStripeClient(env);
      const customer = await stripe.customers.retrieve(customerId);
      if (!('deleted' in customer)) userId = customer.metadata?.userId ?? null;
    } catch { /* ignore */ }
  }
  if (!userId) {
    console.error('Subscription without userId', subscription.id);
    return;
  }

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key
    || (item?.price?.metadata as Record<string, string> | undefined)?.lovable_external_id
    || item?.price?.id
    || null;
  const productId = typeof item?.price?.product === 'string' ? item.price.product : item?.price?.product?.id ?? null;
  const rawItem = item as unknown as { current_period_start?: number; current_period_end?: number } | undefined;
  const rawSub = subscription as unknown as { current_period_start?: number; current_period_end?: number };
  const periodStart = rawItem?.current_period_start ?? rawSub.current_period_start ?? null;
  const periodEnd = rawItem?.current_period_end ?? rawSub.current_period_end ?? null;

  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' },
  );

  const active = isSubscriptionActive({ status: subscription.status, current_period_end: periodEnd });
  await syncMembershipEntitlements(userId, active);
}