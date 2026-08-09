CREATE TABLE public.nutrition_targets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  calories integer NOT NULL DEFAULT 2200,
  protein_g integer NOT NULL DEFAULT 150,
  carbs_g integer NOT NULL DEFAULT 220,
  fat_g integer NOT NULL DEFAULT 70,
  water_ml integer NOT NULL DEFAULT 2800,
  method text NOT NULL DEFAULT 'calculated',
  sex text,
  age integer,
  height_cm numeric,
  activity_level text,
  goal text,
  protein_per_kg numeric NOT NULL DEFAULT 2.0,
  basis_weight_kg numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_targets TO authenticated;
GRANT ALL ON public.nutrition_targets TO service_role;
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own nutrition targets" ON public.nutrition_targets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER nutrition_targets_updated_at BEFORE UPDATE ON public.nutrition_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  meal text NOT NULL DEFAULT 'snacks',
  name text NOT NULL,
  brand text,
  barcode text,
  serving_label text,
  grams numeric,
  calories numeric NOT NULL DEFAULT 0,
  protein_g numeric NOT NULL DEFAULT 0,
  carbs_g numeric NOT NULL DEFAULT 0,
  fat_g numeric NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'manual',
  saved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX food_entries_user_day_idx ON public.food_entries (user_id, logged_on DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_entries TO authenticated;
GRANT ALL ON public.food_entries TO service_role;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own food entries" ON public.food_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  ml integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hydration_logs_user_day_idx ON public.hydration_logs (user_id, logged_on DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hydration_logs TO authenticated;
GRANT ALL ON public.hydration_logs TO service_role;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hydration logs" ON public.hydration_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);