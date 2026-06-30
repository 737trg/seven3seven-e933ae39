import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_marketing/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    navigate({ to: "/my-programmes" });
  };

  return (
    <section className="min-h-[60vh] grid place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <p className="eyebrow text-signal mb-3">New password</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Set a new password</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="block eyebrow mb-1.5">New password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full h-12 bg-transparent border-b border-border focus:border-bone text-bone outline-none" />
          </label>
          {error && <p className="text-signal text-sm">{error}</p>}
          <button disabled={busy} className="w-full h-12 bg-bone text-obsidian text-xs uppercase tracking-widest font-display disabled:opacity-50">
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>
        <p className="mt-8 text-sm text-foreground-muted">
          <Link to="/sign-in" className="text-bone underline">Back to sign in</Link>
        </p>
      </div>
    </section>
  );
}