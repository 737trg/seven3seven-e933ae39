import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns a short-lived signed URL for the current published version PDF
 * of a product, after verifying the caller has an active entitlement.
 * Never exposes the storage path or a permanent URL.
 */
export const getProgrammeDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown): { slug: string } => {
    const slug = (d as any)?.slug;
    if (typeof slug !== "string" || !/^[a-z0-9-]{2,64}$/.test(slug)) {
      throw new Error("Invalid product slug.");
    }
    return { slug };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: product, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (pErr || !product) throw new Error("Programme not found.");

    const { data: ent } = await supabaseAdmin
      .from("entitlements")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .is("revoked_at", null)
      .maybeSingle();
    if (!ent) throw new Error("You do not have access to this programme.");

    const { data: version, error: vErr } = await supabaseAdmin
      .from("programme_versions")
      .select("pdf_path, version")
      .eq("product_id", product.id)
      .eq("is_current", true)
      .eq("is_published", true)
      .maybeSingle();
    if (vErr || !version?.pdf_path) throw new Error("No published PDF is available yet.");

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("programme-files")
      .createSignedUrl(version.pdf_path, 300, { download: true });
    if (sErr || !signed?.signedUrl) throw new Error("Could not generate download link.");

    return { url: signed.signedUrl, version: version.version, expiresInSeconds: 300 };
  });