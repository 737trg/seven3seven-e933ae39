import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EntitledProduct = {
  entitlement_id: string;
  product_id: string;
  programme_version_id: string | null;
  slug: string;
  name: string;
  base_path: string | null;
  collection: string;
  duration_weeks: number | null;
  /** True when this unlock comes from a Club membership rather than a purchase. */
  via_membership: boolean;
};

export function useEntitlements(userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EntitledProduct[]>([]);
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setItems([]);
    (async () => {
      const { data, error } = await supabase
        .from("entitlements")
        .select("id, product_id, programme_version_id, metadata, products(slug, name, base_path, collection, duration_weeks)")
        .eq("user_id", userId)
        .is("revoked_at", null);
      if (!active) return;
      if (error || !data) {
        setItems([]);
      } else {
        setItems(
          data
            .filter((r) => r.products)
            .map((r) => ({
              entitlement_id: r.id,
              product_id: r.product_id,
              programme_version_id: r.programme_version_id,
              slug: (r.products as any).slug,
              name: (r.products as any).name,
              base_path: (r.products as any).base_path,
              collection: (r.products as any).collection,
              duration_weeks: (r.products as any).duration_weeks,
              via_membership: (r.metadata as Record<string, unknown> | null)?.membership === true,
            })),
        );
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, nonce]);

  return { loading, items, refresh };
}