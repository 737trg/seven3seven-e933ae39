import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EntitledProduct = {
  product_id: string;
  slug: string;
  name: string;
  base_path: string | null;
  collection: string;
};

export function useEntitlements(userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EntitledProduct[]>([]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("entitlements")
        .select("product_id, products(slug, name, base_path, collection)")
        .is("revoked_at", null);
      if (!active) return;
      if (error || !data) {
        setItems([]);
      } else {
        setItems(
          data
            .filter((r) => r.products)
            .map((r) => ({
              product_id: r.product_id,
              slug: (r.products as any).slug,
              name: (r.products as any).name,
              base_path: (r.products as any).base_path,
              collection: (r.products as any).collection,
            })),
        );
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId]);

  return { loading, items };
}