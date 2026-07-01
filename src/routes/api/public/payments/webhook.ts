import { createFileRoute } from '@tanstack/react-router';
import type Stripe from 'stripe';
import { type StripeEnv, verifyWebhook, createStripeClient } from '@/lib/stripe.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function fulfilCheckoutSession(sessionId: string, env: StripeEnv) {
  const stripe = createStripeClient(env);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'total_details.breakdown', 'payment_intent'],
  });

  if (session.status !== 'complete') return;
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return;

  const userId = session.metadata?.userId;
  const productSlugs = (session.metadata?.product_slugs ?? '').split(',').filter(Boolean);
  if (!userId || productSlugs.length === 0) {
    console.error('Webhook missing metadata', { userId, productSlugs });
    return;
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

  // Find promotion code applied (if any)
  let promotionCode: string | null = null;
  const discounts = (session as any).discounts as { promotion_code?: string | Stripe.PromotionCode | null }[] | undefined;
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

  // Upsert order (idempotent on stripe_checkout_session_id)
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

    // Grant entitlement (unique on user_id+product_id would be ideal; we
    // check-then-insert since existing table has no unique constraint).
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
}

async function handleEvent(event: Stripe.Event, env: StripeEnv) {
  // Idempotency: record the event first; if it's a duplicate, skip.
  const supabase = supabaseAdmin;
  const { error: dupErr } = await supabase
    .from('processed_payment_events')
    .insert({ stripe_event_id: event.id, stripe_event_type: event.type });
  if (dupErr && (dupErr as any).code === '23505') {
    // duplicate — already processed
    return;
  }
  if (dupErr) throw dupErr;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await fulfilCheckoutSession(session.id, env);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (!piId) break;
        const { data: order } = await supabase
          .from('orders')
          .select('id, user_id')
          .eq('stripe_payment_intent_id', piId)
          .maybeSingle();
        if (!order) break;
        // Full refund only when amount_refunded equals amount
        if (charge.amount_refunded >= charge.amount) {
          await supabase
            .from('orders')
            .update({ order_status: 'refunded', payment_status: 'refunded', refunded_at: new Date().toISOString() })
            .eq('id', order.id);
          const { data: revoked } = await supabase
            .from('entitlements')
            .update({ revoked_at: new Date().toISOString() })
            .eq('order_id', order.id)
            .is('revoked_at', null)
            .select('product_id');
          // Wipe workout progress for the revoked programmes so a re-purchase
          // starts fresh. Deletes are scoped to (user_id, product-linked
          // programme_version_id) so unrelated programmes are untouched.
          const productIds = (revoked ?? []).map((r) => r.product_id).filter(Boolean) as string[];
          if (productIds.length > 0) {
            const { data: versions } = await supabase
              .from('programme_versions')
              .select('id')
              .in('product_id', productIds);
            const versionIds = (versions ?? []).map((v) => v.id);
            if (versionIds.length > 0) {
              await supabase.from('workout_results').delete()
                .eq('user_id', order.user_id).in('programme_version_id', versionIds);
              await supabase.from('session_completions').delete()
                .eq('user_id', order.user_id).in('programme_version_id', versionIds);
              await supabase.from('readiness_logs').delete()
                .eq('user_id', order.user_id).in('programme_version_id', versionIds);
              await supabase.from('programme_enrolments').delete()
                .eq('user_id', order.user_id).in('programme_version_id', versionIds);
            }
          }
        }
        break;
      }
      default:
        // Unhandled — recorded as processed
        break;
    }
  } catch (e) {
    // Mark event as failed so retries are allowed
    await supabase
      .from('processed_payment_events')
      .update({ processing_status: 'failed', error_message: (e as Error).message })
      .eq('stripe_event_id', event.id);
    // And delete it so the retry can re-insert cleanly
    await supabase.from('processed_payment_events').delete().eq('stripe_event_id', event.id);
    throw e;
  }
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get('env');
        if (rawEnv !== 'sandbox' && rawEnv !== 'live') {
          return Response.json({ received: true, ignored: 'invalid env' });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          await handleEvent(event, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error('Webhook error:', e);
          return new Response('Webhook error', { status: 400 });
        }
      },
    },
  },
});