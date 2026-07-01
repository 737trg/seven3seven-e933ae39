
-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  subtotal_pence INTEGER NOT NULL DEFAULT 0,
  discount_pence INTEGER NOT NULL DEFAULT 0,
  total_pence INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'gbp',
  promotion_code TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  programme_version_id UUID REFERENCES public.programme_versions(id),
  stripe_price_id TEXT,
  unit_price_pence INTEGER NOT NULL DEFAULT 0,
  discount_pence INTEGER NOT NULL DEFAULT 0,
  final_price_pence INTEGER NOT NULL DEFAULT 0,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, product_id)
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

-- Processed payment events (idempotency ledger)
CREATE TABLE public.processed_payment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  stripe_event_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'processed',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.processed_payment_events TO service_role;
ALTER TABLE public.processed_payment_events ENABLE ROW LEVEL SECURITY;

-- Entitlement enhancements
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS programme_version_id UUID REFERENCES public.programme_versions(id),
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Map canonical product slugs to Stripe price ids via metadata
UPDATE public.products
  SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{stripe_price_id}', '"basic_training_blueprint_plus_lifetime"')
  WHERE slug='basic-training-blueprint-plus';
UPDATE public.products
  SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{stripe_price_id}', '"sem_2026_lifetime"')
  WHERE slug='sem-2026';

-- Backfill: link canonical published programme_version onto existing entitlements
UPDATE public.entitlements e
  SET programme_version_id = pv.id
  FROM public.programme_versions pv
  WHERE pv.product_id = e.product_id
    AND pv.is_current = true
    AND e.programme_version_id IS NULL;

-- Helper: does user have an active (non-revoked, non-expired) entitlement to product?
CREATE OR REPLACE FUNCTION public.user_has_entitlement(_user_id uuid, _product_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements
    WHERE user_id = _user_id
      AND product_id = _product_id
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;
GRANT EXECUTE ON FUNCTION public.user_has_entitlement(uuid, uuid) TO authenticated, service_role;
