import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_marketing/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <section className="min-h-[60vh] grid place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <p className="eyebrow text-signal mb-3">Reset</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Forgot password</h1>
        {sent ? (
          <p className="text-foreground-muted text-sm mt-6">
            If an account exists for <span className="text-bone">{email}</span>, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="block eyebrow mb-1.5">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-12 bg-transparent border-b border-border focus:border-bone text-bone outline-none" />
            </label>
            {error && <p className="text-signal text-sm">{error}</p>}
            <button disabled={busy} className="w-full h-12 bg-bone text-obsidian text-xs uppercase tracking-widest font-display disabled:opacity-50">
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="mt-8 text-sm text-foreground-muted">
          <Link to="/sign-in" className="text-bone underline">Back to sign in</Link>
        </p>
      </div>
    </section>
  );
}
