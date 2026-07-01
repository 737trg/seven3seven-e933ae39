CREATE OR REPLACE FUNCTION public.has_active_entitlement(_user_id uuid, _product_id uuid, _programme_version_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.entitlements e
    WHERE e.user_id = auth.uid()
      AND e.user_id = _user_id
      AND e.product_id = _product_id
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
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT public.has_active_entitlement(_user_id, _product_id, NULL);
$$;

REVOKE EXECUTE ON FUNCTION public.has_active_entitlement(uuid, uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_product_entitlement(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_entitlement(uuid, uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_active_product_entitlement(uuid, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_has_entitlement(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_has_entitlement(uuid, uuid) TO authenticated, service_role;