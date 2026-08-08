import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useEntitlements } from "@/lib/useEntitlements";
import { useMembership } from "@/lib/useMembership";
import { createMembershipCheckout, createMembershipPortal } from "@/lib/membership.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { ArrowRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/_marketing/account")({
  head: () => ({
    meta: [
      { title: "Account — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

type ProfileForm = {
  display_name: string;
  first_name: string;
  last_name: string;
  unit_preference: "metric" | "imperial";
};

function AccountPage() {
  const { user, loading } = useAuth();
  const { items: entitled } = useEntitlements(user?.id);
  const membership = useMembership(user?.id);
  const [membershipBusy, setMembershipBusy] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileForm>({
    display_name: "",
    first_name: "",
    last_name: "",
    unit_preference: "metric",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, first_name, last_name, unit_preference" as any)
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        const d = data as any;
        setForm({
          display_name: d.display_name ?? "",
          first_name: d.first_name ?? "",
          last_name: d.last_name ?? "",
          unit_preference: d.unit_preference === "imperial" ? "imperial" : "metric",
        });
      }
    })();
  }, [user?.id]);

  if (!loading && !user) {
    return (
      <section className="min-h-[60vh] grid place-items-center px-5 py-20">
        <div className="max-w-md text-center">
          <p className="eyebrow text-signal mb-3">Members only</p>
          <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Sign in</h1>
          <p className="text-foreground-muted text-sm mt-4">You need an account to manage your profile.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/sign-in" className="h-11 px-6 inline-flex items-center bg-bone text-obsidian text-xs uppercase tracking-widest font-display">Sign in</Link>
          </div>
        </div>
      </section>
    );
  }

  const displayHeading =
    form.display_name || form.first_name || "Complete your profile";

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileMsg(null);
    setSavingProfile(true);
    const payload = {
      id: user.id,
      email: user.email,
      display_name: form.display_name || null,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      unit_preference: form.unit_preference,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").upsert(payload as any, { onConflict: "id" });
    if (!error) {
      // Mirror display_name into auth metadata so greetings update immediately.
      await supabase.auth.updateUser({
        data: {
          display_name: form.display_name || null,
          first_name: form.first_name || null,
          last_name: form.last_name || null,
        },
      });
    }
    setProfileMsg(error ? error.message : "Saved.");
    setSavingProfile(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setPwMsg("Passwords do not match."); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwMsg(error ? error.message : "Password updated.");
    if (!error) { setPw(""); setPw2(""); }
    setSavingPw(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
      <p className="eyebrow text-foreground-muted mb-6">Account</p>
      <h1 className="font-display font-bold text-bone tracking-[-0.025em] leading-[0.9] text-[clamp(2.25rem,5vw,4rem)]">
        {displayHeading}
      </h1>
      <p className="text-foreground-muted text-sm mt-4">{user?.email}</p>

      <div className="mt-14 grid lg:grid-cols-2 gap-14">
        {/* Profile */}
        <form onSubmit={saveProfile} className="space-y-6">
          <h2 className="eyebrow border-b border-border/60 pb-4">Profile</h2>
          <Field label="Display name">
            <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-6">
            <Field label="First name">
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Last name">
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="Units">
            <select value={form.unit_preference} onChange={(e) => setForm({ ...form, unit_preference: e.target.value as "metric" | "imperial" })} className={inputCls}>
              <option value="metric">Metric (kg, km)</option>
              <option value="imperial">Imperial (lb, mi)</option>
            </select>
          </Field>
          <div className="flex items-center gap-4">
            <button disabled={savingProfile} className="h-11 px-6 bg-bone text-obsidian text-xs uppercase tracking-widest font-display disabled:opacity-50">
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
            {profileMsg && <span className="text-xs text-foreground-muted">{profileMsg}</span>}
          </div>
        </form>

        {/* Password */}
        <form onSubmit={changePassword} className="space-y-6">
          <h2 className="eyebrow border-b border-border/60 pb-4">Password</h2>
          <Field label="New password">
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={inputCls} autoComplete="new-password" />
          </Field>
          <div className="flex items-center gap-4">
            <button disabled={savingPw} className="h-11 px-6 border border-border text-bone text-xs uppercase tracking-widest font-display disabled:opacity-50">
              {savingPw ? "Updating…" : "Update password"}
            </button>
            {pwMsg && <span className="text-xs text-foreground-muted">{pwMsg}</span>}
          </div>
        </form>
      </div>

      {/* Owned programmes */}
      <div className="mt-16">
        <h2 className="eyebrow border-b border-border/60 pb-4 mb-6">Owned programmes</h2>
        {entitled.length === 0 ? (
          <p className="text-foreground-muted text-sm">No programmes yet.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {entitled.map((e) => (
              <li key={e.product_id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-bone font-display uppercase tracking-widest text-sm">{e.name}</p>
                  <p className="text-foreground-muted text-xs mt-1">
                    {e.via_membership ? "Included with membership" : "Lifetime access"}
                  </p>
                </div>
                {e.base_path ? (
                  <a href={e.base_path} className="inline-flex items-center gap-2 text-bone text-xs uppercase tracking-widest hover:text-signal">
                    Open <ArrowRight className="h-3 w-3" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Membership */}
      <div className="mt-16">
        <h2 className="eyebrow border-b border-border/60 pb-4 mb-6">Membership</h2>
        {membership.isMember ? (
          <div className="space-y-3">
            <p className="text-bone text-sm">
              SEVEN3SEVEN Club — {membership.cancelAtPeriodEnd ? "ends" : "renews"}{" "}
              {membership.renewsOn ? new Date(membership.renewsOn).toLocaleDateString("en-GB") : "—"}
            </p>
            <button
              onClick={async () => {
                setMembershipBusy(true);
                const res = await createMembershipPortal({
                  data: { returnUrl: `${window.location.origin}/account`, environment: getStripeEnvironment() },
                });
                setMembershipBusy(false);
                if ("url" in res) window.open(res.url, "_blank", "noopener");
              }}
              disabled={membershipBusy}
              className="inline-flex items-center gap-2 h-11 px-5 border border-border text-bone text-[11px] uppercase tracking-[0.28em] font-display hover:border-bone"
            >
              Manage membership
            </button>
          </div>
        ) : membership.isLegacy ? (
          <p className="text-foreground-muted text-sm">
            You were with us before the Club launched — the coaching, PB and metrics tools stay
            unlocked on your account for free.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-foreground-muted text-sm">
              Not a member. £14.99/month unlocks every programme plus the full coaching toolkit.
            </p>
            <button
              onClick={async () => {
                setMembershipBusy(true);
                const res = await createMembershipCheckout({
                  data: {
                    returnUrl: `${window.location.origin}/checkout/success`,
                    cancelUrl: `${window.location.origin}/account`,
                    environment: getStripeEnvironment(),
                  },
                });
                setMembershipBusy(false);
                if ("url" in res && res.url) window.location.href = res.url;
              }}
              disabled={membershipBusy}
              className="inline-flex items-center gap-2 h-11 px-5 bg-signal text-bone text-[11px] uppercase tracking-[0.28em] font-display"
            >
              Join the Club
            </button>
            <Link to="/pricing" className="block text-foreground-muted text-xs uppercase tracking-widest hover:text-bone">
              See what&rsquo;s included <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      <div className="mt-16 border-t border-border/60 pt-8 flex items-center justify-between">
        <p className="text-foreground-muted text-xs uppercase tracking-widest">Session</p>
        <button onClick={signOut} className="inline-flex items-center gap-2 text-bone text-xs uppercase tracking-widest hover:text-signal">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </section>
  );
}

const inputCls = "w-full h-11 px-3 bg-transparent border border-border text-bone text-sm focus:outline-none focus:border-bone";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block eyebrow text-foreground-muted mb-2">{label}</span>
      {children}
    </label>
  );
}
