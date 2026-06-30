import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findSession, isCore } from "@/lib/sem/manifest";

export type SemProgress = {
  loading: boolean;
  coreCompleted: number;
  optionalCompleted: number;
  resultsLogged: number;
  perSession: Record<string, { completed: boolean; results: number }>;
};

/**
 * Reads real session_completions + workout_results for the current user,
 * scoped to the SEM 8 product. RLS guarantees row scoping to auth.uid().
 */
export function useSemProgress(userId: string | undefined, productSlug = "sem-8") {
  const [state, setState] = useState<SemProgress>({
    loading: true, coreCompleted: 0, optionalCompleted: 0, resultsLogged: 0, perSession: {},
  });

  useEffect(() => {
    let active = true;
    if (!userId) { setState({ loading: false, coreCompleted: 0, optionalCompleted: 0, resultsLogged: 0, perSession: {} }); return; }
    (async () => {
      const { data: product } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle();
      if (!product) { if (active) setState((s) => ({ ...s, loading: false })); return; }
      const [{ data: comps }, { data: results }] = await Promise.all([
        supabase.from("session_completions").select("session_id").eq("product_id", product.id),
        supabase.from("workout_results").select("session_id").eq("product_id", product.id),
      ]);
      if (!active) return;
      const per: Record<string, { completed: boolean; results: number }> = {};
      let core = 0, opt = 0;
      (comps ?? []).forEach((c) => {
        const sid = c.session_id;
        per[sid] = per[sid] ?? { completed: false, results: 0 };
        per[sid].completed = true;
        const ref = findSession(sid);
        if (!ref || isCore(ref.session)) core++; else opt++;
      });
      (results ?? []).forEach((r) => {
        const sid = r.session_id;
        per[sid] = per[sid] ?? { completed: false, results: 0 };
        per[sid].results += 1;
      });
      setState({
        loading: false,
        coreCompleted: core,
        optionalCompleted: opt,
        resultsLogged: (results ?? []).length,
        perSession: per,
      });
    })();
    return () => { active = false; };
  }, [userId, productSlug]);

  return state;
}