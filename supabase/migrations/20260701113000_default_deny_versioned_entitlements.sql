-- Harden entitlement helpers: default-deny, versioned ownership, and no cross-user probing.
CREATE OR REPLACE FUNCTION public.has_active_entitlement(_user_id uuid, _product_id uuid, _programme_version_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    _user_id = auth.uid()
    OR public.is_staff(auth.uid())
    OR current_setting('role', true) = 'service_role'
  )
  AND EXISTS (
    SELECT 1
    FROM public.entitlements e
    WHERE e.user_id = _user_id
      AND e.product_id = _product_id
      AND e.programme_version_id IS NOT NULL
      AND e.revoked_at IS NULL
      AND (e.expires_at IS NULL OR e.expires_at > now())
      AND (
        _programme_version_id IS NULL
        OR e.programme_version_id = _programme_version_id
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.has_active_product_entitlement(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_active_entitlement(_user_id, _product_id, NULL);
$$;

CREATE OR REPLACE FUNCTION public.user_has_entitlement(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_active_product_entitlement(_user_id, _product_id);
$$;

REVOKE ALL ON FUNCTION public.has_active_entitlement(uuid, uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_active_product_entitlement(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_has_entitlement(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_entitlement(uuid, uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_active_product_entitlement(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_has_entitlement(uuid, uuid) TO authenticated, service_role;

-- Ensure customers can only see their own active, versioned entitlements.
DROP POLICY IF EXISTS "entitlements_select_own_or_staff" ON public.entitlements;
DROP POLICY IF EXISTS entitlements_select_own_or_staff ON public.entitlements;
CREATE POLICY entitlements_select_own_versioned_or_staff
ON public.entitlements
FOR SELECT
TO authenticated
USING (
  public.is_staff(auth.uid())
  OR (
    auth.uid() = user_id
    AND programme_version_id IS NOT NULL
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- Writes remain service-role/staff only through privileged server workflows.
DROP POLICY IF EXISTS entitlements_insert_staff ON public.entitlements;
DROP POLICY IF EXISTS entitlements_update_staff ON public.entitlements;
DROP POLICY IF EXISTS entitlements_delete_staff ON public.entitlements;
CREATE POLICY entitlements_insert_staff
ON public.entitlements
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY entitlements_update_staff
ON public.entitlements
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY entitlements_delete_staff
ON public.entitlements
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

-- Keep ATHX private/archived and version-bound.
UPDATE public.products
SET status = 'archived'::product_status,
    metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{private}', 'true'::jsonb)
WHERE slug = 'athx-2026';

-- Ensure James alone has the active ATHX private-version entitlement.
WITH athx AS (
  SELECT id AS product_id FROM public.products WHERE slug = 'athx-2026'
), private_version AS (
  SELECT pv.id AS version_id, pv.product_id
  FROM public.programme_versions pv
  JOIN athx ON athx.product_id = pv.product_id
  WHERE pv.version = '1.0.0-private'
  ORDER BY pv.created_at DESC
  LIMIT 1
), james AS (
  SELECT 'ec9e5293-c116-4608-89fe-febd190133cf'::uuid AS user_id
  WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = 'ec9e5293-c116-4608-89fe-febd190133cf'::uuid)
)
INSERT INTO public.entitlements (user_id, product_id, programme_version_id, source, revoked_at, metadata)
SELECT james.user_id, private_version.product_id, private_version.version_id, 'admin'::entitlement_source, NULL, '{"private":"athx-2026"}'::jsonb
FROM james, private_version
ON CONFLICT (user_id, product_id)
DO UPDATE SET
  programme_version_id = excluded.programme_version_id,
  revoked_at = NULL,
  expires_at = NULL,
  metadata = coalesce(public.entitlements.metadata, '{}'::jsonb) || excluded.metadata;

-- Remove any active ATHX entitlement that is not attached to the James auth user.
UPDATE public.entitlements e
SET revoked_at = coalesce(revoked_at, now()),
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('revoked_reason', 'athx_private_default_deny_cleanup')
FROM public.products p
WHERE e.product_id = p.id
  AND p.slug = 'athx-2026'
  AND e.user_id <> 'ec9e5293-c116-4608-89fe-febd190133cf'::uuid
  AND e.revoked_at IS NULL;
