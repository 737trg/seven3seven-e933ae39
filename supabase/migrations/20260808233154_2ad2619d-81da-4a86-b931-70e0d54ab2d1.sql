-- 1. Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text,
  price_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Grandfathering flag
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legacy_full_access boolean NOT NULL DEFAULT false;

UPDATE public.profiles p
SET legacy_full_access = true
WHERE EXISTS (
  SELECT 1 FROM public.entitlements e
  WHERE e.user_id = p.id AND e.revoked_at IS NULL
);

-- 3. Access checks
CREATE OR REPLACE FUNCTION public.has_active_membership(_user_id uuid, _environment text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = _user_id
      AND s.environment = _environment
      AND (
        (s.status IN ('active','trialing','past_due')
          AND (s.current_period_end IS NULL OR s.current_period_end > now()))
        OR (s.status = 'canceled' AND s.current_period_end > now())
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.has_club_access(_user_id uuid, _environment text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_active_membership(_user_id, _environment)
     OR EXISTS (
       SELECT 1 FROM public.profiles p
       WHERE p.id = _user_id AND p.legacy_full_access
     );
$$;

GRANT EXECUTE ON FUNCTION public.has_active_membership(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_club_access(uuid, text) TO authenticated;

-- 4. Leaderboard opt-in
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS leaderboard_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS leaderboard_name text;

-- 5. Monthly activity leaderboard (app-recorded sessions only)
CREATE OR REPLACE FUNCTION public.monthly_leaderboard(_month_start date)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  sessions_completed bigint,
  total_seconds bigint,
  is_me boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sc.user_id,
    COALESCE(up.leaderboard_name, 'Athlete') AS display_name,
    COUNT(*)::bigint AS sessions_completed,
    COALESCE(SUM(sc.duration_seconds), 0)::bigint AS total_seconds,
    (sc.user_id = auth.uid()) AS is_me
  FROM public.session_completions sc
  JOIN public.user_preferences up ON up.user_id = sc.user_id
  WHERE up.leaderboard_opt_in
    AND sc.completed_at >= _month_start
    AND sc.completed_at < (_month_start + INTERVAL '1 month')
  GROUP BY sc.user_id, up.leaderboard_name
  ORDER BY sessions_completed DESC, total_seconds DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.monthly_leaderboard(date) TO authenticated;