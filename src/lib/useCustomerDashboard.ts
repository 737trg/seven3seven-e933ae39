import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EntitledProduct } from "@/lib/useEntitlements";
import { HRP } from "@/lib/hrp/manifest";
import { BTB } from "@/lib/btb/manifest";
import { SEM } from "@/lib/sem/manifest";
import { SEM27 } from "@/lib/sem2027/manifest";
import { MIXED } from "@/lib/mixed/manifest";
import { TOTAL } from "@/lib/total/manifest";
import { PROGRAMME as ATHX } from "@/data/programme";
import { ensureProgrammeContents } from "@/lib/programmeContent";

type EnrolmentRow = {
  id: string;
  product_id: string;
  started_at: string;
  updated_at: string;
  current_week: number | null;
  completion_pct: number | null;
  state: unknown;
};

type CompletionRow = {
  id: string;
  product_id: string;
  session_id: string;
  completed_at: string;
  week: number | null;
};

type ResultRow = {
  id: string;
  product_id: string;
  session_id: string;
  block_id: string | null;
  kind: string | null;
  logged_at: string;
  payload: unknown;
};

export type ProgrammeState = "ready" | "active" | "completed";

export type CustomerProgramme = EntitledProduct & {
  state: ProgrammeState;
  enrolment: EnrolmentRow | null;
  completions: CompletionRow[];
  results: ResultRow[];
};

export type ActivityItem = {
  ts: string;
  kind: "programme-start" | "programme-complete" | "session" | "result";
  title: string;
  sub: string;
  productSlug: string;
};

export type CustomerDashboard = {
  loading: boolean;
  programmes: CustomerProgramme[];
  activeCount: number;
  currentWeek: number | null;
  sessionsCompleted: number;
  resultsLogged: number;
  recent: ActivityItem[];
};

const EMPTY: CustomerDashboard = {
  loading: false,
  programmes: [],
  activeCount: 0,
  currentWeek: null,
  sessionsCompleted: 0,
  resultsLogged: 0,
  recent: [],
};

export function useCustomerDashboard(userId: string | undefined, entitlements: EntitledProduct[], entitlementsLoading: boolean): CustomerDashboard {
  const [state, setState] = useState<CustomerDashboard>({ ...EMPTY, loading: true });
  const entitlementKey = useMemo(
    () => entitlements.map((e) => `${e.product_id}:${e.programme_version_id ?? "none"}`).sort().join("|"),
    [entitlements],
  );

  useEffect(() => {
    let active = true;
    if (entitlementsLoading) {
      setState({ ...EMPTY, loading: true });
      return () => { active = false; };
    }
    if (!userId || entitlements.length === 0) {
      setState(EMPTY);
      return () => { active = false; };
    }

    (async () => {
      setState((prev) => ({ ...prev, loading: true }));
      // Paid programme content is fetched per entitlement before any manifest
      // lookups below can run.
      await ensureProgrammeContents(entitlements.map((e) => e.slug));
      if (!active) return;
      const productIds = entitlements.map((e) => e.product_id);
      const [enrolmentsRes, completionsRes, resultsRes] = await Promise.all([
        supabase
          .from("programme_enrolments")
          .select("id, product_id, started_at, updated_at, current_week, completion_pct, state")
          .eq("user_id", userId)
          .in("product_id", productIds),
        supabase
          .from("session_completions")
          .select("id, product_id, session_id, completed_at, week")
          .eq("user_id", userId)
          .in("product_id", productIds),
        supabase
          .from("workout_results")
          .select("id, product_id, session_id, block_id, kind, logged_at, payload")
          .eq("user_id", userId)
          .in("product_id", productIds),
      ]);
      if (!active) return;

      const enrolments = (enrolmentsRes.data ?? []) as EnrolmentRow[];
      const completions = (completionsRes.data ?? []) as CompletionRow[];
      const results = (resultsRes.data ?? []) as ResultRow[];
      const enrolmentByProduct = new Map(enrolments.map((e) => [e.product_id, e]));

      const programmes: CustomerProgramme[] = entitlements.map((entitlement) => {
        const enrolment = enrolmentByProduct.get(entitlement.product_id) ?? null;
        const state: ProgrammeState = !enrolment
          ? "ready"
          : (enrolment.completion_pct ?? 0) >= 100
            ? "completed"
            : "active";
        return {
          ...entitlement,
          state,
          enrolment,
          completions: completions.filter((c) => c.product_id === entitlement.product_id),
          results: results.filter((r) => r.product_id === entitlement.product_id),
        };
      });

      const activeProgrammes = programmes
        .filter((p) => p.state === "active" && p.enrolment)
        .sort((a, b) => (b.enrolment!.updated_at < a.enrolment!.updated_at ? -1 : 1));

      const byProductSlug = new Map(programmes.map((p) => [p.product_id, { slug: p.slug, name: p.name }]));

      const sessionTitleFor = (slug: string, sessionId: string): string | undefined => {
        try {
          if (slug === "hybrid-race-plan") {
            for (const w of HRP.weeks) for (const s of w.sessions) if (`hrp-w${w.week}-s${s.session}` === sessionId) return s.title;
          } else if (slug === "basic-training-blueprint-plus") {
            for (const w of BTB.weeks) for (const s of w.sessions) if (`btb-w${w.week}-s${s.session}` === sessionId) return s.title;
          } else if (slug === "sem-2026") {
            for (const w of SEM.weeks) for (const s of w.sessions) if (`sem8-w${w.week}-s${s.session}` === sessionId || `sem-w${w.week}-s${s.session}` === sessionId) return s.title;
          } else if (slug === "sem-2027") {
            for (const w of SEM27.weeks) for (const s of w.sessions) if (`sem27-w${w.week}-s${s.session}` === sessionId) return s.title;
          } else if (slug === "mixed") {
            for (const w of MIXED.weeks) for (const s of w.sessions) if (`mixed-w${w.week}-s${s.session}` === sessionId) return s.title;
          } else if (slug === "build-total") {
            for (const w of TOTAL.weeks) for (const s of w.sessions) if (`total-w${w.week}-s${s.session}` === sessionId) return s.title;
          } else if (slug === "athx-2026") {
            const s = ATHX.weeks.flatMap((w) => w.sessions).find((x) => x.id === sessionId);
            return s?.title;
          }
        } catch { /* ignore */ }
        return undefined;
      };

      const recent: ActivityItem[] = [
        ...programmes
          .filter((p) => p.enrolment)
          .map((p) => ({
            ts: p.enrolment!.started_at,
            kind: "programme-start" as const,
            title: `Started ${p.name}`,
            sub: "Programme start",
            productSlug: p.slug,
          })),
        ...programmes
          .filter((p) => p.state === "completed" && p.enrolment)
          .map((p) => ({
            ts: p.enrolment!.updated_at,
            kind: "programme-complete" as const,
            title: `Completed ${p.name}`,
            sub: "Programme complete",
            productSlug: p.slug,
          })),
        ...completions.map((c) => {
          const product = byProductSlug.get(c.product_id);
          const title = sessionTitleFor(product?.slug ?? "", c.session_id);
          return {
            ts: c.completed_at,
            kind: "session" as const,
            title: title ? `Completed ${title}` : "Session completed",
            sub: `${product?.name ?? "Programme"}${c.week ? ` · Week ${c.week}` : ""}`,
            productSlug: product?.slug ?? "",
          };
        }),
        ...results.map((r) => {
          const product = byProductSlug.get(r.product_id);
          const title = sessionTitleFor(product?.slug ?? "", r.session_id);
          return {
            ts: r.logged_at,
            kind: "result" as const,
            title: title ? `Logged result · ${title}` : "Result logged",
            sub: `${product?.name ?? "Programme"}${r.kind ? ` · ${r.kind}` : ""}`,
            productSlug: product?.slug ?? "",
          };
        }),
      ].sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 5);

      // Current-week fallback: use the primary (most-recently-updated) active
      // programme's stored current_week; if missing, derive from started_at.
      const primary = activeProgrammes[0];
      let currentWeek: number | null = primary?.enrolment?.current_week ?? null;
      if (!currentWeek && primary?.enrolment?.started_at) {
        const startMs = new Date(primary.enrolment.started_at).getTime();
        if (!Number.isNaN(startMs)) {
          const weeks = Math.floor((Date.now() - startMs) / (7 * 24 * 60 * 60 * 1000)) + 1;
          const cap = primary.duration_weeks ?? 12;
          currentWeek = Math.max(1, Math.min(cap, weeks));
        }
      }

      setState({
        loading: false,
        programmes,
        activeCount: activeProgrammes.length,
        currentWeek,
        sessionsCompleted: completions.length,
        resultsLogged: results.length,
        recent,
      });
    })();

    return () => { active = false; };
  }, [userId, entitlementKey, entitlementsLoading]);

  return state;
}
