import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { LeaderboardPanel } from "@/components/dashboard/LeaderboardPanel";
import { ClubLock } from "@/components/dashboard/ClubLock";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { createMembershipPortal } from "@/lib/membership.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import type { MembershipState } from "@/lib/useMembership";

const PERKS = [
  "Every programme, current and future",
  "Readiness check and load suggestions",
  "PB trends and strength standards",
  "Body metrics log and trends",
  "Monthly consistency leaderboard",
];

export function ClubTab({
  userId,
  membership,
}: {
  userId: string | undefined;
  membership: MembershipState;
}) {
  const openPortal = useServerFn(createMembershipPortal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const club = membership.hasClubAccess;

  async function manage() {
    setError(null);
    setBusy(true);
    try {
      const result = await openPortal({
        data: { returnUrl: `${window.location.origin}/account`, environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const renews = membership.renewsOn
    ? new Date(membership.renewsOn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="space-y-6">
      <SectionCard title="Membership">
        {club ? (
          <div>
            <p className="inline-flex items-center gap-2 text-signal font-display uppercase text-[11px] tracking-[0.24em]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
              {membership.isMember ? "Club member" : "Full access — founding customer"}
            </p>
            <p className="body-sm mt-3">
              {membership.isMember
                ? membership.cancelAtPeriodEnd
                  ? `Your membership ends on ${renews}. You keep everything until then.`
                  : renews
                    ? `Everything is unlocked. Renews ${renews}.`
                    : "Everything is unlocked."
                : "You bought before the Club launched, so every member feature stays unlocked for you — free, for good."}
            </p>
            <ul className="mt-5 space-y-2">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-bone text-sm">
                  <Check className="h-4 w-4 text-signal mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            {membership.isMember && (
              <button
                onClick={manage}
                disabled={busy}
                className="press mt-6 h-12 px-6 inline-flex items-center justify-center border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display hover:border-bone"
              >
                {busy ? "Opening…" : "Manage billing"}
              </button>
            )}
            {error && <p className="text-signal text-sm mt-3">{error}</p>}
          </div>
        ) : (
          <div>
            <p className="body-sm">
              You own your programmes for life. Club membership adds coaching, standards, metrics and
              the leaderboard for £14.99 a month.
            </p>
            <ul className="mt-5 space-y-2">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-bone text-sm">
                  <Check className="h-4 w-4 text-foreground-muted mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Link to="/pricing" className="btn-signal press tap mt-6 inline-flex items-center justify-center">
              Join the Club — £14.99/mo
            </Link>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Leaderboard">
        <ClubLock unlocked={club} blurb="Compete on monthly consistency with other members.">
          <LeaderboardPanel userId={userId} />
        </ClubLock>
      </SectionCard>

      <SectionCard title="Quick actions">
        <SideLink to="/programmes" label="Browse programmes" />
        <SideLink to="/account" label="My account" />
      </SectionCard>
    </div>
  );
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="press min-h-12 flex items-center justify-between py-4 text-bone text-sm hover:text-signal transition-colors border-b border-border/60 last:border-0"
    >
      <span>{label}</span>
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}
