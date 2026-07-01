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
        const env = (url.searchParams.get('env') ?? 'live') as StripeEnv;
        if (!/^[a-zA-Z0-9-]{20,}$/.test(userId) || (env !== 'sandbox' && env !== 'live')) {
          return new Response('Bad request', { status: 400 });
        }
        const { recoverPendingPurchasesForUser } = await import('@/lib/fulfilment.server');
        try {
          const fulfilled = await recoverPendingPurchasesForUser(userId, env);
          return Response.json({ ok: true, fulfilled });
        } catch (e) {
          return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});