import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Idempotently create a programme_enrolments row for the current user + product slug.
 * Only called when the customer actively starts the programme.
 */
export const ensureEnrolment = createServerFn({ method: "POST" })
  .validator((d: unknown): { slug: string } => {
    const slug = (d as any)?.slug;
    if (typeof slug !== "string" || !/^[a-z0-9-]{2,64}$/.test(slug)) {
      throw new Error("Invalid product slug.");
    }
    return { slug };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (pErr || !product) throw new Error("Programme not found.");

    const { data: ent } = await supabase
      .from("entitlements")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .is("revoked_at", null)
      .maybeSingle();
    if (!ent) throw new Error("You do not have access to this programme.");

    const { data: existing } = await supabase
      .from("programme_enrolments")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .maybeSingle();
    if (existing) return { enrolmentId: existing.id, created: false };

    const { data: inserted, error: iErr } = await supabase
      .from("programme_enrolments")
      .insert({ user_id: userId, product_id: product.id })
      .select("id")
      .single();
    if (iErr || !inserted) throw new Error("Could not start programme.");
    return { enrolmentId: inserted.id, created: true };
  });