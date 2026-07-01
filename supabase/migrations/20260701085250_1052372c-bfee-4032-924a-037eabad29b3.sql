DROP POLICY IF EXISTS entitlements_select_own_or_staff ON public.entitlements;
CREATE POLICY entitlements_select_own ON public.entitlements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM authenticated;