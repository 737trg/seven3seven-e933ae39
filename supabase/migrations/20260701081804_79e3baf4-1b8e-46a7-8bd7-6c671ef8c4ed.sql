
-- 1. Remove owner role from test customer
DELETE FROM public.user_roles
WHERE user_id = 'ec9e5293-c116-4608-89fe-febd190133cf'
  AND role = 'owner';

-- 2. Rename S.E.M. 8 → S.E.M. 2026 and move BTB+ under /my-programmes/
UPDATE public.products
SET slug = 'sem-2026',
    name = 'S.E.M. 2026',
    base_path = '/my-programmes/sem-2026'
WHERE slug = 'sem-8';

UPDATE public.products
SET base_path = '/my-programmes/basic-training-blueprint-plus'
WHERE slug = 'basic-training-blueprint-plus';

-- 3. Re-issue test customer entitlements as normal admin-granted lifetime access (idempotent).
WITH tgt AS (
  SELECT 'ec9e5293-c116-4608-89fe-febd190133cf'::uuid AS user_id
),
prods AS (
  SELECT id FROM public.products
  WHERE slug IN ('athx-2026', 'sem-2026', 'basic-training-blueprint-plus')
)
INSERT INTO public.entitlements (user_id, product_id, source, granted_by, revoked_at)
SELECT tgt.user_id, prods.id, 'admin'::entitlement_source, NULL, NULL
FROM tgt CROSS JOIN prods
ON CONFLICT (user_id, product_id) DO UPDATE
SET source = EXCLUDED.source,
    granted_by = EXCLUDED.granted_by,
    revoked_at = NULL;

-- 4. Prevent customers from ever writing to user_roles from the app.
--    (No INSERT/UPDATE/DELETE policies exist, so RLS already blocks writes;
--     ensure no permissive write policies were left behind.)
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='user_roles' AND cmd IN ('INSERT','UPDATE','DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.user_roles', p.policyname);
  END LOOP;
END $$;

-- 5. Prevent customers from writing to their own entitlements
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='entitlements' AND cmd IN ('INSERT','UPDATE','DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.entitlements', p.policyname);
  END LOOP;
END $$;
