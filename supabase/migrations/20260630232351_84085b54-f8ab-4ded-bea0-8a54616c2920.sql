
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS founding_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS cta_label TEXT,
  ADD COLUMN IF NOT EXISTS meaning TEXT;

ALTER TABLE public.programme_versions
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;

-- Storage policies for programme-files bucket
DROP POLICY IF EXISTS "Entitled users can read their programme files" ON storage.objects;
DROP POLICY IF EXISTS "Staff can read all programme files" ON storage.objects;
DROP POLICY IF EXISTS "Staff can write programme files" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update programme files" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete programme files" ON storage.objects;

CREATE POLICY "Entitled users can read their programme files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'programme-files'
  AND EXISTS (
    SELECT 1 FROM public.entitlements e
    JOIN public.products p ON p.id = e.product_id
    WHERE e.user_id = auth.uid()
      AND e.revoked_at IS NULL
      AND split_part(storage.objects.name, '/', 1) = p.slug
  )
);

CREATE POLICY "Staff can read all programme files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'programme-files' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can write programme files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'programme-files' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update programme files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'programme-files' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete programme files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'programme-files' AND public.is_staff(auth.uid()));
