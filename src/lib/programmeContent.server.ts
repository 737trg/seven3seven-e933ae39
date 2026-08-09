/**
 * SERVER ONLY — paid programme content.
 *
 * These manifests are the product. They must never be imported from a module
 * that can reach the client bundle; the only way to read them is through
 * `getProgrammeContent`, which verifies the caller's entitlement first.
 */
import btb from "@/data/private/btb.manifest.json";
import hrp from "@/data/private/hrp.manifest.json";
import sem from "@/data/private/sem8.manifest.json";
import sem27 from "@/data/private/sem2027.manifest.json";
import mixed from "@/data/private/mixed.manifest.json";
import total from "@/data/private/total.manifest.json";

/** Product slug → full programme manifest. */
export const PROGRAMME_MANIFESTS: Record<string, unknown> = {
  "basic-training-blueprint-plus": btb,
  "hybrid-race-plan": hrp,
  "sem-2026": sem,
  "sem-2027": sem27,
  mixed,
  "build-total": total,
};