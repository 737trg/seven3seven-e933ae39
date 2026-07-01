-- Default-deny helper functions for active entitlements.
CREATE OR REPLACE FUNCTION public.has_active_entitlement(_user_id uuid, _product_id uuid, _programme_version_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.entitlements e
    WHERE e.user_id = _user_id
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
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_active_entitlement(_user_id, _product_id, NULL);
$$;

GRANT EXECUTE ON FUNCTION public.has_active_entitlement(uuid, uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_active_product_entitlement(uuid, uuid) TO authenticated, service_role;

-- New signups receive a profile and base customer role only. No programme entitlement is granted here.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name', split_part(new.email,'@',1))
  ) on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'athlete')
  on conflict (user_id, role) do nothing;

  return new;
end;
$function$;

-- Products: public can see only published catalogue products; authenticated customers can also see private products they actively own.
DROP POLICY IF EXISTS products_select_published_auth ON public.products;
CREATE POLICY products_select_published_auth
ON public.products
FOR SELECT
TO authenticated
USING (
  status = 'published'::product_status
  OR public.is_staff(auth.uid())
  OR public.has_active_product_entitlement(auth.uid(), id)
);

-- Programme versions: require published/current matching entitled version unless staff.
DROP POLICY IF EXISTS programme_versions_select_entitled ON public.programme_versions;
CREATE POLICY programme_versions_select_entitled
ON public.programme_versions
FOR SELECT
TO authenticated
USING (
  public.is_staff(auth.uid())
  OR (
    is_published = true
    AND public.has_active_entitlement(auth.uid(), product_id, id)
  )
);

-- Enrolments are own-row only and require an active entitlement to the programme.
DROP POLICY IF EXISTS enrolments_select_own ON public.programme_enrolments;
DROP POLICY IF EXISTS enrolments_insert_own_entitled ON public.programme_enrolments;
DROP POLICY IF EXISTS enrolments_update_own ON public.programme_enrolments;
DROP POLICY IF EXISTS enrolments_delete_own ON public.programme_enrolments;

CREATE POLICY enrolments_select_own
ON public.programme_enrolments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY enrolments_insert_own_entitled
ON public.programme_enrolments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
);

CREATE POLICY enrolments_update_own
ON public.programme_enrolments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
)
WITH CHECK (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
);

CREATE POLICY enrolments_delete_own
ON public.programme_enrolments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Session completions are own-row only and require an active entitlement to the programme.
DROP POLICY IF EXISTS completions_select_own ON public.session_completions;
DROP POLICY IF EXISTS completions_insert_own ON public.session_completions;
DROP POLICY IF EXISTS completions_update_own ON public.session_completions;
DROP POLICY IF EXISTS completions_delete_own ON public.session_completions;

CREATE POLICY completions_select_own
ON public.session_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY completions_insert_own
ON public.session_completions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
);

CREATE POLICY completions_update_own
ON public.session_completions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
)
WITH CHECK (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
);

CREATE POLICY completions_delete_own
ON public.session_completions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Workout results are own-row only and require an active entitlement to the programme.
DROP POLICY IF EXISTS results_select_own ON public.workout_results;
DROP POLICY IF EXISTS results_insert_own ON public.workout_results;
DROP POLICY IF EXISTS results_update_own ON public.workout_results;
DROP POLICY IF EXISTS results_delete_own ON public.workout_results;

CREATE POLICY results_select_own
ON public.workout_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY results_insert_own
ON public.workout_results
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
);

CREATE POLICY results_update_own
ON public.workout_results
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
)
WITH CHECK (
  auth.uid() = user_id
  AND public.has_active_product_entitlement(auth.uid(), product_id)
);

CREATE POLICY results_delete_own
ON public.workout_results
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Readiness logs currently have no programme column, so lock them strictly to the owner row.
DROP POLICY IF EXISTS readiness_select_own ON public.readiness_logs;
DROP POLICY IF EXISTS readiness_insert_own ON public.readiness_logs;
DROP POLICY IF EXISTS readiness_update_own ON public.readiness_logs;
DROP POLICY IF EXISTS readiness_delete_own ON public.readiness_logs;

CREATE POLICY readiness_select_own
ON public.readiness_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY readiness_insert_own
ON public.readiness_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY readiness_update_own
ON public.readiness_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY readiness_delete_own
ON public.readiness_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Private programme files require an active entitlement for the owning programme slug.
DROP POLICY IF EXISTS "Entitled users can read their programme files" ON storage.objects;
CREATE POLICY "Entitled users can read their programme files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'programme-files'
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE split_part(storage.objects.name, '/', 1) = p.slug
      AND public.has_active_product_entitlement(auth.uid(), p.id)
  )
);