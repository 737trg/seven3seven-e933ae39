import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/_marketing/sign-up")({
  head: () => ({
    meta: [
      { title: "Sign up — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Create your SEVEN3SEVEN account." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
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
        <p className="eyebrow text-signal mb-3">Create account</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">Sign up</h1>
        <p className="text-foreground-muted text-sm mt-3">Train. Log. Repeat.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Name" value={displayName} onChange={setDisplayName} type="text" autoComplete="name" />
          <Field label="Email" value={email} onChange={setEmail} type="email" required autoComplete="email" />
          <Field label="Password" value={password} onChange={setPassword} type="password" required autoComplete="new-password" minLength={8} />
          {error && <p className="text-signal text-sm">{error}</p>}
          <button type="submit" disabled={busy} className="w-full h-12 bg-bone text-obsidian text-xs uppercase tracking-widest font-display disabled:opacity-50">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-foreground-muted uppercase tracking-widest">
          <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
        </div>

        <button onClick={onGoogle} className="w-full h-12 border border-border text-bone text-xs uppercase tracking-widest font-display hover:border-bone">
          Continue with Google
        </button>

        <p className="mt-8 text-sm text-foreground-muted">
          Already have an account? <Link to="/sign-in" className="text-bone underline">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

function Field({
  label, value, onChange, type, required, autoComplete, minLength,
}: { label: string; value: string; onChange: (v: string) => void; type: string; required?: boolean; autoComplete?: string; minLength?: number }) {
  return (
    <label className="block">
      <span className="block eyebrow mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="w-full h-12 bg-transparent border-b border-border focus:border-bone text-bone outline-none px-0"
      />
    </label>
  );
}
