import type {
  DevelopmentUser,
  ProgrammeEntitlement,
  ProgrammeEnrolment,
  ProgrammeManifest,
} from "@/types/platform";

export const developmentUser: DevelopmentUser = {
  id: "dev-nico",
  name: "Nico",
  role: "owner",
  isDevelopmentUser: true,
  ownedProgrammes: ["athx-2026"],
};

export const developmentEntitlements: ProgrammeEntitlement[] = [
  {
    userId: developmentUser.id,
    programmeSlug: "athx-2026",
    grantedAt: "2026-06-29T00:00:00.000Z",
    source: "development",
  },
];

export const developmentProgrammeManifests: Record<string, ProgrammeManifest> = {
  "athx-2026": {
    id: "athx-2026",
    slug: "athx-2026",
    name: "ATHX 2026",
    subtitle: "Seven-week hybrid competition preparation.",
    collection: "compete",
    version: { version: "1.0", releasedAt: "2026-06-29T00:00:00.000Z" },
    durationWeeks: 8,
    sessionsPerWeek: "5-6 sessions / week",
    difficulty: "Intermediate / Advanced",
    cover: {
      eyebrow: "Compete",
      headline: "ATHX 2026",
      sub: "Seven-week hybrid competition preparation.",
    },
    enabledPages: {
      today: true,
      programme: true,
      progress: true,
      race: true,
      calculator: true,
      learn: true,
      profile: true,
    },
    basePath: "/my-programmes/athx-2026",
  },
};

export const developmentEnrolments: ProgrammeEnrolment[] = [
  {
    userId: developmentUser.id,
    programmeSlug: "athx-2026",
    startedAt: "2026-06-29T00:00:00.000Z",
  },
];

export const useDevUser = () => developmentUser;

export const hasAccess = (slug: string) =>
  developmentEntitlements.some(
    (e) => e.userId === developmentUser.id && e.programmeSlug === slug,
  );

export const getOwnedManifests = (): ProgrammeManifest[] =>
  developmentUser.ownedProgrammes
    .map((slug) => developmentProgrammeManifests[slug])
    .filter((m): m is ProgrammeManifest => Boolean(m));
