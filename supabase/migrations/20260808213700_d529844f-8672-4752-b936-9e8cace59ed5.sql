-- Keep the earliest completion per (user, product, session), drop later duplicates.
DELETE FROM public.session_completions a
USING public.session_completions b
WHERE a.user_id = b.user_id
  AND a.product_id = b.product_id
  AND a.session_id = b.session_id
  AND a.completed_at > b.completed_at;

DELETE FROM public.session_completions a
USING public.session_completions b
WHERE a.user_id = b.user_id
  AND a.product_id = b.product_id
  AND a.session_id = b.session_id
  AND a.completed_at = b.completed_at
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS session_completions_user_product_session_key
  ON public.session_completions (user_id, product_id, session_id);