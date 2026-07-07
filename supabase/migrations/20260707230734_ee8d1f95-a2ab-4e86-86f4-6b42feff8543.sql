-- Promote HRP to the new interactive v2.1 version.
-- Enrolments are keyed by product_id, so users automatically pick up the
-- new "current" version. Entitlements that pin to a specific version are
-- re-pointed so existing owners keep access without any UI action.

DO $$
DECLARE
  v_product_id uuid := '20904ec3-32e1-47fc-b522-749e33221c6e'; -- hybrid-race-plan
  v_new_id uuid;
BEGIN
  -- Insert new version (or reuse if it somehow already exists).
  INSERT INTO public.programme_versions (product_id, version, notes, manifest, is_current, is_published, published_at)
  VALUES (
    v_product_id,
    'HRP_INTERACTIVE_V2_1',
    'Interactive rebuild: block-typed sessions, per-kind logging, corrected timers.',
    '{}'::jsonb,
    true,
    true,
    now()
  )
  ON CONFLICT (product_id, version) DO UPDATE
    SET is_current = true,
        is_published = true,
        published_at = COALESCE(public.programme_versions.published_at, now())
  RETURNING id INTO v_new_id;

  -- Demote all prior HRP versions.
  UPDATE public.programme_versions
     SET is_current = false
   WHERE product_id = v_product_id
     AND id <> v_new_id;

  -- Silently move every non-revoked HRP entitlement onto the new version.
  UPDATE public.entitlements
     SET programme_version_id = v_new_id
   WHERE product_id = v_product_id
     AND revoked_at IS NULL
     AND (programme_version_id IS NULL OR programme_version_id <> v_new_id);
END $$;