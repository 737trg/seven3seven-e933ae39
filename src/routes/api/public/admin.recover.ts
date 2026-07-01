import { createFileRoute } from '@tanstack/react-router';
import type { StripeEnv } from '@/lib/stripe.server';

// One-shot recovery endpoint. Requires the project LOVABLE_API_KEY as the
// bearer token (server-only secret). Safe to leave in place — without the
// secret it just returns 401.
export const Route = createFileRoute('/api/public/admin/recover')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get('authorization') ?? '';
        const expected = `Bearer ${process.env.LOVABLE_API_KEY ?? ''}`;
        if (!process.env.LOVABLE_API_KEY || auth !== expected) {
          return new Response('Unauthorized', { status: 401 });
        }
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId') ?? '';
        const email = url.searchParams.get('email') ?? '';
        const debug = url.searchParams.get('debug') === '1';
        const reassignTo = url.searchParams.get('reassignTo') ?? '';
        const env = (url.searchParams.get('env') ?? 'live') as StripeEnv;
        if (env !== 'sandbox' && env !== 'live') {
          return new Response('Bad request', { status: 400 });
        }
        const { recoverPendingPurchasesForUser, fulfilCheckoutSession } = await import('@/lib/fulfilment.server');
        const { createStripeClient } = await import('@/lib/stripe.server');
        try {
          const stripe = createStripeClient(env);
          const seenSessions = new Set<string>();
          const fulfilled: string[] = [];
          const debugInfo: unknown[] = [];

          if (/^[a-zA-Z0-9-]{20,}$/.test(userId)) {
            const r = await recoverPendingPurchasesForUser(userId, env);
            for (const s of r) { fulfilled.push(s); seenSessions.add(s); }
          }

          if (email) {
            const customers = await stripe.customers.list({ email, limit: 10 });
            for (const c of customers.data) {
              const sessions = await stripe.checkout.sessions.list({ customer: c.id, limit: 20 });
              if (debug) debugInfo.push({ customer: c.id, meta: c.metadata, sessions: sessions.data.map((s) => ({ id: s.id, status: s.status, payment_status: s.payment_status, meta: s.metadata })) });
              for (const s of sessions.data) {
                if (seenSessions.has(s.id)) continue;
                if (s.status !== 'complete') continue;
                if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') continue;
                if (!s.metadata?.userId) continue;
                try {
                  const did = await fulfilCheckoutSession(s.id, env, reassignTo ? { overrideUserId: reassignTo } : undefined);
                  if (did) { fulfilled.push(s.id); seenSessions.add(s.id); }
                } catch (e) { debugInfo.push({ sessionId: s.id, error: (e as Error).message }); }
              }
            }
          }

          return Response.json({ ok: true, fulfilled, ...(debug && { debug: debugInfo }) });
        } catch (e) {
          return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});