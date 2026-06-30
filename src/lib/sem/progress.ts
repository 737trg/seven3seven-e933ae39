import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: versions } = await supabase.from("programme_versions").select("id").eq("product_id", product.id);
      const versionIds = (versions ?? []).map((v) => v.id);
      if (!active) return;
      if (versionIds.length === 0) { setState((s) => ({ ...s, loading: false })); return; }
      const [{ data: comps }, { data: results }] = await Promise.all([
        supabase.from("session_completions").select("session_external_id, priority").in("programme_version_id", versionIds),
        supabase.from("workout_results").select("session_external_id").in("programme_version_id", versionIds),
      ]);
      if (!active) return;
      const per: Record<string, { completed: boolean; results: number }> = {};
      let core = 0, opt = 0;
      (comps ?? []).forEach((c) => {
        per[c.session_external_id] = per[c.session_external_id] ?? { completed: false, results: 0 };
        per[c.session_external_id].completed = true;
        if ((c.priority ?? "core").toLowerCase() === "core") core++; else opt++;
      });
      (results ?? []).forEach((r) => {
        per[r.session_external_id] = per[r.session_external_id] ?? { completed: false, results: 0 };
        per[r.session_external_id].results += 1;
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