import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findSession, isCore } from "@/lib/total/manifest";

export type TotalProgress = {
  loading: boolean;
  coreCompleted: number;
  optionalCompleted: number;
  resultsLogged: number;
  perSession: Record<string, { completed: boolean; results: number }>;
};

const EMPTY: TotalProgress = {
  loading: false, coreCompleted: 0, optionalCompleted: 0, resultsLogged: 0, perSession: {},
};

/** Real session_completions + workout_results for the TOTAL product. */
export function useTotalProgress(userId: string | undefined, productSlug = "total") {
  const [state, setState] = useState<TotalProgress>({ ...EMPTY, loading: true });

  useEffect(() => {
    let active = true;
    if (!userId) { setState(EMPTY); return; }
    (async () => {
      const { data: product } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle();
      if (!product) { if (active) setState((s) => ({ ...s, loading: false })); return; }
      const [{ data: comps }, { data: results }] = await Promise.all([
        supabase.from("session_completions").select("session_id").eq("user_id", userId).eq("product_id", product.id),
        supabase.from("workout_results").select("session_id").eq("user_id", userId).eq("product_id", product.id),
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