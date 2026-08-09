import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the full programme manifest for a product, but only after verifying
 * the signed-in caller holds a live entitlement for it. Paid workout content is
 * never shipped in the client bundle — it is fetched here, per entitlement.
 */
export const getProgrammeContent = createServerFn({ method: "POST" })
  .validator((d: unknown): { slug: string } => {
    const slug = (d as { slug?: unknown } | null)?.slug;
    if (typeof slug !== "string" || !/^[a-z0-9-]{2,64}$/.test(slug)) {
      throw new Error("Invalid product slug.");
    }
    return { slug };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { PROGRAMME_MANIFESTS } = await import("@/lib/programmeContent.server");

    const manifest = PROGRAMME_MANIFESTS[data.slug];
    if (!manifest) throw new Error("Programme not found.");

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!product) throw new Error("Programme not found.");

    const nowIso = new Date().toISOString();
    const { data: ent } = await supabaseAdmin
      .from("entitlements")
      .select("id, expires_at")
      .eq("user_id", context.userId)
      .eq("product_id", product.id)
      .is("revoked_at", null);
    const active = (ent ?? []).some((e) => !e.expires_at || e.expires_at > nowIso);

    if (!active) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("legacy_full_access")
        .eq("id", context.userId)
        .maybeSingle();
      if (!profile?.legacy_full_access) {
        throw new Error("You do not have access to this programme.");
      }
    }

    return { slug: data.slug, manifest };
  });