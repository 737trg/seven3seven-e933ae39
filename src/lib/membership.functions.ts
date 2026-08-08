import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from '@/lib/stripe.server';

type MembershipCheckoutInput = {
  returnUrl: string;
  cancelUrl: string;
  environment: StripeEnv;
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
        await stripe.customers.update(c.id, { metadata: { ...c.metadata, userId: opts.userId } });
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

/** Starts a Club membership subscription checkout. */
export const createMembershipCheckout = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: MembershipCheckoutInput) => {
    if (typeof data.returnUrl !== 'string' || !data.returnUrl.startsWith('http')) throw new Error('Invalid returnUrl');
    if (typeof data.cancelUrl !== 'string' || !data.cancelUrl.startsWith('http')) throw new Error('Invalid cancelUrl');
    return data;
  })
  .handler(async ({ data, context }): Promise<{ url?: string; sessionId?: string } | { error: string } | { alreadyMember: true }> => {
    try {
      const { supabase, userId } = context;

      const { data: existing } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .eq('environment', data.environment)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing && ['active', 'trialing', 'past_due'].includes(existing.status)) {
        return { alreadyMember: true };
      }

      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? undefined;

      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: ['club_monthly'], active: true, limit: 1 });
      const price = prices.data[0];
      if (!price) throw new Error('Membership price is not configured yet.');

      const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: 'subscription',
        customer: customerId,
        allow_promotion_codes: true,
        success_url: `${data.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: data.cancelUrl,
        metadata: { userId, membership: 'club_monthly' },
        subscription_data: { metadata: { userId, membership: 'club_monthly' } },
      });

      return { url: session.url ?? undefined, sessionId: session.id };
    } catch (error) {
      console.error('createMembershipCheckout error:', error);
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Opens the Stripe billing portal so members can cancel or update payment. */
export const createMembershipPortal = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    try {
      const { supabase, userId } = context;
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .eq('environment', data.environment)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!sub?.stripe_customer_id) return { error: 'No membership found.' };

      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/**
 * Safety net: re-reads the caller's Stripe subscriptions and re-syncs
 * membership state and access. Used after checkout returns.
 */
export const syncMyMembership = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<{ ok: boolean; active: boolean; error?: string }> => {
    try {
      const { syncStripeSubscription, isSubscriptionActive } = await import('@/lib/membership.server');
      const stripe = createStripeClient(data.environment);
      const customers = await stripe.customers.search({
        query: `metadata['userId']:'${context.userId}'`,
        limit: 5,
      });
      let active = false;
      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 10 });
        for (const sub of subs.data) {
          await syncStripeSubscription(sub, data.environment);
          if (isSubscriptionActive({ status: sub.status })) active = true;
        }
      }
      return { ok: true, active };
    } catch (error) {
      return { ok: false, active: false, error: getStripeErrorMessage(error) };
    }
  });