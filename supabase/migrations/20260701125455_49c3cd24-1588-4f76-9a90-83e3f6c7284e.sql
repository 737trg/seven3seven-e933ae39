-- Address linter: signed-in users must not execute SECURITY DEFINER functions.
-- Both functions are called with the caller's own auth.uid() in RLS policies and
-- server code. Row-level security on public.user_roles and public.entitlements
-- already restricts each authenticated user to their own rows, so SECURITY
-- INVOKER produces identical results without granting definer privileges.

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner','admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.user_has_entitlement(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements
    WHERE user_id = _user_id
      AND product_id = _product_id
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Re-assert least-privilege grants (unchanged effective permissions).
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.user_has_entitlement(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_has_entitlement(uuid, uuid) TO authenticated, service_role;
