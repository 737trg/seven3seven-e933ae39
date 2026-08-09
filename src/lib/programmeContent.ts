import { useEffect, useState } from "react";
import { getProgrammeContent } from "@/lib/programmeContent.functions";
import { hydrateBTB } from "@/lib/btb/manifest";
import { hydrateHRP } from "@/lib/hrp/manifest";
import { hydrateSEM } from "@/lib/sem/manifest";
import { hydrateSEM27 } from "@/lib/sem2027/manifest";
import { hydrateMIXED } from "@/lib/mixed/manifest";
import { hydrateTOTAL } from "@/lib/total/manifest";

const HYDRATORS: Record<string, (data: unknown) => void> = {
  "basic-training-blueprint-plus": hydrateBTB,
  "hybrid-race-plan": hydrateHRP,
  "sem-2026": hydrateSEM,
  "sem-2027": hydrateSEM27,
  mixed: hydrateMIXED,
  "build-total": hydrateTOTAL,
};

/** Slugs whose content lives behind the entitlement-checked server function. */
export const GATED_PROGRAMME_SLUGS = Object.keys(HYDRATORS);

const inFlight = new Map<string, Promise<boolean>>();
const loaded = new Set<string>();

export function isProgrammeContentLoaded(slug: string): boolean {
  return !HYDRATORS[slug] || loaded.has(slug);
}

/**
 * Fetches and hydrates a programme's content once per session. Resolves false
 * when the caller is not entitled (or the fetch fails) so callers can gate UI.
 */
export function ensureProgrammeContent(slug: string): Promise<boolean> {
  const hydrate = HYDRATORS[slug];
  if (!hydrate) return Promise.resolve(true);
  if (loaded.has(slug)) return Promise.resolve(true);
  const existing = inFlight.get(slug);
  if (existing) return existing;
  const p = getProgrammeContent({ data: { slug } })
    .then((res) => {
      hydrate((res as { manifest: unknown }).manifest);
      loaded.add(slug);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      inFlight.delete(slug);
    });
  inFlight.set(slug, p);
  return p;
}

export function ensureProgrammeContents(slugs: string[]): Promise<boolean[]> {
  return Promise.all(slugs.map((s) => ensureProgrammeContent(s)));
}

export type ProgrammeContentState = { ready: boolean; denied: boolean };

/** Loads a programme's paid content and reports when it is safe to render. */
export function useProgrammeContent(slug: string, enabled = true): ProgrammeContentState {
  const [state, setState] = useState<ProgrammeContentState>(() => ({
    ready: isProgrammeContentLoaded(slug),
    denied: false,
  }));

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    if (isProgrammeContentLoaded(slug)) {
      setState({ ready: true, denied: false });
      return;
    }
    ensureProgrammeContent(slug).then((ok) => {
      if (active) setState({ ready: ok, denied: !ok });
    });
    return () => {
      active = false;
    };
  }, [slug, enabled]);

  return state;
}