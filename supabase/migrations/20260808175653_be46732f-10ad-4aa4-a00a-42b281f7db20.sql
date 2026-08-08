-- Training preferences (primary programme, units, training days)
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  units text NOT NULL DEFAULT 'kg',
  training_days text[] NOT NULL DEFAULT ARRAY[]::text[],
  onboarding_completed_at timestamptz,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prefs_select_own" ON public.user_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "prefs_insert_own" ON public.user_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_update_own" ON public.user_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_delete_own" ON public.user_preferences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generic personal records (not programme specific)
CREATE TABLE public.personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lift_key text NOT NULL,
  lift_label text NOT NULL,
  metric text NOT NULL DEFAULT 'weight_kg',
  value numeric NOT NULL,
  reps integer,
  unit text NOT NULL DEFAULT 'kg',
  achieved_on date NOT NULL DEFAULT CURRENT_DATE,
  source_session_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX personal_records_user_lift_idx ON public.personal_records (user_id, lift_key, achieved_on DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_records TO authenticated;
GRANT ALL ON public.personal_records TO service_role;

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pr_select_own" ON public.personal_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pr_insert_own" ON public.personal_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pr_update_own" ON public.personal_records
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pr_delete_own" ON public.personal_records
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER personal_records_updated_at
  BEFORE UPDATE ON public.personal_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-user schedule adjustments (move / swap / skip)
CREATE TABLE public.session_schedule_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  action text NOT NULL DEFAULT 'move',
  day_of_week text,
  swap_with_session_id text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id, session_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_schedule_overrides TO authenticated;
GRANT ALL ON public.session_schedule_overrides TO service_role;

ALTER TABLE public.session_schedule_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sso_select_own" ON public.session_schedule_overrides
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sso_insert_own" ON public.session_schedule_overrides
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sso_update_own" ON public.session_schedule_overrides
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sso_delete_own" ON public.session_schedule_overrides
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER session_schedule_overrides_updated_at
  BEFORE UPDATE ON public.session_schedule_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();