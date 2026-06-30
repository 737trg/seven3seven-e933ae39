/**
 * Future-facing platform interfaces for SEVEN3SEVEN.
 * The existing ATHX programme is NOT migrated to these types in this phase —
 * they exist as the template for future programmes only.
 */

export type ProgrammeCollection = "compete" | "build" | "blueprint";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: "owner" | "athlete" | "admin";
}

export interface DevelopmentUser extends User {
  isDevelopmentUser: true;
  ownedProgrammes: string[];
}

export interface ProgrammePageConfig {
  today: boolean;
  programme: boolean;
  progress: boolean;
  race: boolean;
  calculator: boolean;
  learn: boolean;
  profile: boolean;
}

export interface ProgrammeVersion {
  version: string;
  releasedAt: string;
  notes?: string;
}

export interface DigitalDownload {
  id: string;
  label: string;
  filename: string;
  url: string;
  sizeBytes?: number;
  contentType?: string;
}

/** Reusable template every future programme will be generated from. */
export interface ProgrammeManifest {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  collection: ProgrammeCollection;
  version: ProgrammeVersion;
  durationWeeks: number;
  sessionsPerWeek?: string;
  difficulty?: string;
  cover: {
    image?: string;
    headline: string;
    sub?: string;
    eyebrow?: string;
  };
  athleteProfile?: Record<string, unknown>;
  enabledPages: ProgrammePageConfig;
  navLabels?: Partial<Record<keyof ProgrammePageConfig, string>>;
  pdf?: DigitalDownload;
  basePath: string; // e.g. "/my-programmes/athx-2026"
}

export interface Programme {
  id: string;
  slug: string;
  manifest: ProgrammeManifest;
}

export interface ProgrammeEntitlement {
  userId: string;
  programmeSlug: string;
  grantedAt: string;
  source: "development" | "purchase" | "gift" | "admin";
}

export interface ProgrammeEnrolment {
  userId: string;
  programmeSlug: string;
  startedAt?: string;
  currentWeek?: number;
  completionPct?: number;
}

export interface ProgrammeSummary {
  slug: string;
  name: string;
  collection: ProgrammeCollection;
  durationWeeks: number;
  basePath: string;
}