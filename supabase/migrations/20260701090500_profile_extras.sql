ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS unit_preference TEXT NOT NULL DEFAULT 'metric'
    CHECK (unit_preference IN ('metric','imperial'));
