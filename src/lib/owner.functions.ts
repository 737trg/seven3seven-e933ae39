import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * One-time owner claim. Caller must be authenticated AND their email
 * must match the configured owner email. Idempotent.
 * Grants 'owner' role + entitlements to ATHX 2026, Basic Training Blueprint+, S.E.M. 8.
 */
export const claimOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const OWNER_EMAIL = "jamesnichol9@gmail.com";
    const OWNED_SLUGS = ["athx-2026", "basic-training-blueprint-plus", "sem-8"];

    const callerEmail = (context.claims?.email as string | undefined)?.toLowerCase();
    if (!callerEmail || callerEmail !== OWNER_EMAIL.toLowerCase()) {
      throw new Error("Forbidden: only the configured owner email can claim ownership.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Grant 'owner' role (idempotent)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "owner" }, { onConflict: "user_id,role" });
    if (roleError) throw roleError;

    // 2. Look up product ids
    const { data: products, error: prodError } = await supabaseAdmin
      .from("products")
      .select("id, slug")
      .in("slug", OWNED_SLUGS);
    if (prodError) throw prodError;

    // 3. Grant entitlements (idempotent)
    const rows = (products ?? []).map((p) => ({
      user_id: userId,
      product_id: p.id,
      source: "owner" as const,
      granted_by: userId,
    }));
    if (rows.length > 0) {
      const { error: entError } = await supabaseAdmin
        .from("entitlements")
        .upsert(rows, { onConflict: "user_id,product_id" });
      if (entError) throw entError;
    }

    // 4. Audit
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "owner.claim",
      target_type: "user",
      target_id: userId,
      payload: { granted_products: OWNED_SLUGS },
    });

    return { ok: true, granted: OWNED_SLUGS };
  });