import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { weekFromSessionId, dayFromSessionId, pctFrom } from "@/lib/progress.server";

type RecordInput = {
  slug: string;
  sessionId: string;
  durationSec?: number;
  /** Explicit week when the session id does not encode one (e.g. ATHX). */
  week?: number | null;
  /** Total core sessions in the programme, read from the manifest client-side. */
  totalSessions?: number | null;
};

/**
 * Single source of truth for "the athlete finished a session".
 * Records the completion (idempotently), creates the enrolment when missing,
 * and recalculates the programme's completion percentage and current week.
 */
export const recordSessionCompletion = createServerFn({ method: "POST" })
  .validator((d: unknown): RecordInput => {
    const raw = (d ?? {}) as Record<string, unknown>;
    const slug = raw['slug'];
    const sessionId = raw['sessionId'];
    if (typeof slug !== "string" || !/^[a-z0-9-]{2,64}$/.test(slug)) throw new Error("Invalid programme.");
    if (typeof sessionId !== "string" || sessionId.length === 0 || sessionId.length > 128) throw new Error("Invalid session.");
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    return {
      slug,
      sessionId,
      durationSec: num(raw['durationSec']) ?? undefined,
      week: num(raw['week']),
      totalSessions: num(raw['totalSessions']),
    };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: product } = await supabase
      .from("products")
      .select("id, duration_weeks")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!product) throw new Error("Programme not found.");

    const { data: ent } = await supabase
      .from("entitlements")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .is("revoked_at", null)
      .maybeSingle();
    if (!ent) throw new Error("You do not have access to this programme.");

    const week = data.week ?? weekFromSessionId(data.sessionId);
    const day = dayFromSessionId(data.sessionId);

    await supabase
      .from("session_completions")
      .upsert(
        {
          user_id: userId,
          product_id: product.id,
          session_id: data.sessionId,
          week,
          day,
          completed_at: new Date().toISOString(),
          duration_seconds: data.durationSec ?? null,
        },
        { onConflict: "user_id,product_id,session_id" },
      );

    // Enrolment must exist for the library to show the programme as active.
    const { data: enrolment } = await supabase
      .from("programme_enrolments")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .maybeSingle();
    let enrolmentId = enrolment?.id ?? null;
    if (!enrolmentId) {
      const { data: created } = await supabase
        .from("programme_enrolments")
        .insert({ user_id: userId, product_id: product.id })
        .select("id")
        .single();
      enrolmentId = created?.id ?? null;
    }

    const { data: rows } = await supabase
      .from("session_completions")
      .select("session_id, week")
      .eq("user_id", userId)
      .eq("product_id", product.id);

    const completions = rows ?? [];
    const uniqueDone = new Set(completions.map((r) => r.session_id)).size;
    const total = data.totalSessions ?? null;
    const completionPct = total ? pctFrom(uniqueDone, total) : null;
    const maxWeek = completions.reduce<number>((m, r) => Math.max(m, r.week ?? 0), 0);
    const currentWeek = maxWeek > 0 ? Math.min(maxWeek, product.duration_weeks ?? maxWeek) : (week ?? null);

    if (enrolmentId) {
      await supabase
        .from("programme_enrolments")
        .update({
          current_week: currentWeek,
          ...(completionPct !== null ? { completion_pct: completionPct } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrolmentId);
    }

    return { ok: true, sessionsCompleted: uniqueDone, completionPct, currentWeek };
  });
