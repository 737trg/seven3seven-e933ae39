import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export type MembershipState = {
  loading: boolean;
  /** True when the athlete has an active Club subscription. */
  isMember: boolean;
  /** True when they were a customer before Club launched — access is kept free. */
  isLegacy: boolean;
  /** Club features unlocked either way. */
  hasClubAccess: boolean;
  status: string | null;
  renewsOn: string | null;
  cancelAtPeriodEnd: boolean;
  refresh: () => void;
};

const ACTIVE = ["active", "trialing", "past_due"];

export function useMembership(userId: string | undefined): MembershipState {
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isLegacy, setIsLegacy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [renewsOn, setRenewsOn] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      setIsMember(false);
      setIsLegacy(false);
      return;
    }
    setLoading(true);
    (async () => {
      const env = getStripeEnvironment();
      const [subRes, profileRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("status, current_period_end, cancel_at_period_end")
          .eq("user_id", userId)
          .eq("environment", env)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("profiles").select("legacy_full_access").eq("id", userId).maybeSingle(),
      ]);
      if (!active) return;
      const sub = subRes.data;
      const future = !sub?.current_period_end || new Date(sub.current_period_end).getTime() > Date.now();
      const memberNow = !!sub && future && (ACTIVE.includes(sub.status) || sub.status === "canceled");
      setIsMember(memberNow);
      setStatus(sub?.status ?? null);
      setRenewsOn(sub?.current_period_end ?? null);
      setCancelAtPeriodEnd(!!sub?.cancel_at_period_end);
      setIsLegacy(!!profileRes.data?.legacy_full_access);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, nonce]);

  return {
    loading,
    isMember,
    isLegacy,
    hasClubAccess: isMember || isLegacy,
    status,
    renewsOn,
    cancelAtPeriodEnd,
    refresh,
  };
}