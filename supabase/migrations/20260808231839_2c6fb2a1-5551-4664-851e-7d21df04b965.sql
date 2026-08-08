CREATE TABLE public.body_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  weight_kg numeric,
  bodyfat_pct numeric,
  resting_hr integer,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, measured_on)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_metrics TO authenticated;
GRANT ALL ON public.body_metrics TO service_role;

ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own body metrics" ON public.body_metrics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own body metrics" ON public.body_metrics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own body metrics" ON public.body_metrics
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own body metrics" ON public.body_metrics
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER body_metrics_updated_at BEFORE UPDATE ON public.body_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX body_metrics_user_date_idx ON public.body_metrics (user_id, measured_on DESC);