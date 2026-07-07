
-- Upgrade Hybrid Race Plan to the new 12-week programme version.
-- Existing customers keep their access; entitlements are silently re-pointed.

WITH prod AS (
  SELECT id FROM public.products WHERE slug = 'hybrid-race-plan' LIMIT 1
), new_version AS (
  INSERT INTO public.programme_versions (product_id, version, notes, is_current, is_published, published_at)
  SELECT prod.id, '2.0.0',
         'Hybrid Race Plan 12-week programme (source PDF v2).',
         true, true, now()
  FROM prod
  ON CONFLICT (product_id, version) DO UPDATE
    SET is_current = true, is_published = true, published_at = COALESCE(programme_versions.published_at, now())
  RETURNING id, product_id
)
UPDATE public.programme_versions pv
   SET is_current = false
  FROM new_version nv
 WHERE pv.product_id = nv.product_id AND pv.id <> nv.id;

-- Re-point every existing Hybrid Race Plan entitlement to the new version
-- so the version-scoped read policy keeps returning true. No re-purchase.
UPDATE public.entitlements e
   SET programme_version_id = pv.id,
       updated_at = now()
  FROM public.programme_versions pv
  JOIN public.products p ON p.id = pv.product_id
 WHERE p.slug = 'hybrid-race-plan'
   AND pv.is_current = true
   AND e.product_id = p.id
   AND (e.programme_version_id IS DISTINCT FROM pv.id);
