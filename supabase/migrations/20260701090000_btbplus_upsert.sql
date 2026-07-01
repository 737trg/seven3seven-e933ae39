-- Ensure BTB+ product exists so entitlement can attach.
INSERT INTO public.products (slug, name, base_path, collection, status)
VALUES ('basic-training-blueprint-plus', 'Basic Training Blueprint+', '/my-programmes/basic-training-blueprint-plus', 'programme'::product_collection, 'active'::product_status)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    base_path = EXCLUDED.base_path;

INSERT INTO public.products (slug, name, base_path, collection, status)
VALUES ('athx-2026', 'ATHX 2026', '/my-programmes/athx-2026', 'programme'::product_collection, 'active'::product_status)
ON CONFLICT (slug) DO NOTHING;

-- Idempotent entitlement re-issue for test customer.
INSERT INTO public.entitlements (user_id, product_id, source, granted_by, revoked_at)
SELECT 'ec9e5293-c116-4608-89fe-febd190133cf'::uuid, p.id, 'admin'::entitlement_source, NULL, NULL
FROM public.products p
WHERE p.slug IN ('athx-2026', 'sem-2026', 'basic-training-blueprint-plus')
ON CONFLICT (user_id, product_id) DO UPDATE
SET revoked_at = NULL;
