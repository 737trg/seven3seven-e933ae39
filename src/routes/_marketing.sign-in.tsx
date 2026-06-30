import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/_marketing/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Sign in to your SEVEN3SEVEN account." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    navigate({ to: "/my-programmes" });
  };

  const onGoogle = async () => {
    setError(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setError(r.error.message);
    else if (!r.redirected) navigate({ to: "/my-programmes" });
  };

  return (
    <section className="min-h-[70vh] grid place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <p className="eyebrow text-signal mb-3">Welcome back</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Sign in</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="block eyebrow mb-1.5">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="w-full h-12 bg-transparent border-b border-border focus:border-bone text-bone outline-none px-0" />
          </label>
          <label className="block">
            <span className="block eyebrow mb-1.5">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full h-12 bg-transparent border-b border-border focus:border-bone text-bone outline-none px-0" />
          </label>
          {error && <p className="text-signal text-sm">{error}</p>}
          <button type="submit" disabled={busy} className="w-full h-12 bg-bone text-obsidian text-xs uppercase tracking-widest font-display disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-foreground-muted uppercase tracking-widest">
          <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
        </div>

        <button onClick={onGoogle} className="w-full h-12 border border-border text-bone text-xs uppercase tracking-widest font-display hover:border-bone">
          Continue with Google
        </button>

        <div className="mt-8 flex items-center justify-between text-sm text-foreground-muted">
          <Link to="/forgot-password" className="hover:text-bone">Forgot password?</Link>
          <Link to="/sign-up" className="text-bone underline">Create account</Link>
        </div>
      </div>
    </section>
  );
}
