import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * True when the athlete bought this programme outright (one-off purchase or
 * a staff/owner grant). Membership entitlements are tagged
 * `metadata.membership = true` and deliberately do NOT count — the permanent
 * PDF belongs to one-off buyers only.
 */
export function useOwnedOutright(userId: string | undefined, slug: string) {
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setOwned(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("entitlements")
        .select("id, metadata, products!inner(slug)")
        .eq("user_id", userId)
        .is("revoked_at", null)
        .eq("products.slug", slug);
      if (!active) return;
      const hit = (data ?? []).some(
        (row) => (row.metadata as Record<string, unknown> | null)?.membership !== true,
      );
      setOwned(hit);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, slug]);

  return { loading, owned };
}