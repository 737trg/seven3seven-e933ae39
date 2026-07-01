-- HYBRID RACE PLAN — product, canonical v1.0.0 programme version, entitlement for James.
INSERT INTO public.products (slug, name, base_path, collection, status)
VALUES ('hybrid-race-plan', 'Hybrid Race Plan', '/my-programmes/hybrid-race-plan', 'programme'::product_collection, 'active'::product_status)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    base_path = EXCLUDED.base_path,
    status = 'active'::product_status;

-- One canonical version row per product (idempotent).
INSERT INTO public.programme_versions (product_id, version, notes, is_current)
SELECT p.id, '1.0.0', 'Hybrid Race Plan initial launch', true
FROM public.products p
WHERE p.slug = 'hybrid-race-plan'
ON CONFLICT (product_id, version) DO UPDATE
SET is_current = true;

-- Grant lifetime access to the test customer (James).
INSERT INTO public.entitlements (user_id, product_id, source, granted_by, revoked_at)
SELECT 'ec9e5293-c116-4608-89fe-febd190133cf'::uuid, p.id, 'admin'::entitlement_source, NULL, NULL
FROM public.products p
WHERE p.slug = 'hybrid-race-plan'
ON CONFLICT (user_id, product_id) DO UPDATE
SET revoked_at = NULL;
