import { createFileRoute } from '@tanstack/react-router';
import type Stripe from 'stripe';
import { type StripeEnv, verifyWebhook } from '@/lib/stripe.server';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { fulfilCheckoutSession } from '@/lib/fulfilment.server';
import { syncStripeSubscription } from '@/lib/membership.server';

async function handleEvent(event: Stripe.Event, env: StripeEnv) {
  // Idempotency: record the event first; if it's a duplicate, skip.
  const supabase = supabaseAdmin;
  const { error: dupErr } = await supabase
    .from('processed_payment_events')
    .insert({ stripe_event_id: event.id, stripe_event_type: event.type });
  if (dupErr && (dupErr as { code?: string }).code === '23505') {
    // duplicate — already processed
    return;
  }
  if (dupErr) throw dupErr;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          // Membership: the customer.subscription.* events do the work.
          break;
        }
        await fulfilCheckoutSession(session.id, env);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncStripeSubscription(event.data.object as Stripe.Subscription, env);
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