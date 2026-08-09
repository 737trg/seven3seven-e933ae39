import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const SITE = "https://737trg.com";

type State = "loading" | "valid" | "invalid" | "already" | "done" | "error";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
  head: () => ({
    meta: [
      { title: "Unsubscribe — SEVEN3SEVEN" },
      { name: "description", content: "Manage your SEVEN3SEVEN email preferences and unsubscribe from training emails." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Unsubscribe — SEVEN3SEVEN" },
      { property: "og:description", content: "Manage your SEVEN3SEVEN email preferences." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/unsubscribe` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/unsubscribe` }],
  }),
});

function UnsubscribePage() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    if (!t) {
      setState("invalid");
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.valid === false) {
          setState(data?.alreadyUnsubscribed ? "already" : "invalid");
          return;
        }
        setState(data?.alreadyUnsubscribed ? "already" : "valid");
      })
      .catch(() => setState("error"));
  }, []);

  const confirm = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md text-center space-y-6">
        <p className="eyebrow">SEVEN3SEVEN</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-[-0.03em]">Email preferences</h1>

        {state === "loading" && <p className="text-foreground-muted text-sm">Checking your link…</p>}

        {state === "valid" && (
          <>
            <p className="text-foreground-muted text-sm">
              Confirm below to stop receiving training reminders and recap emails from SEVEN3SEVEN.
            </p>
            <button
              onClick={confirm}
              disabled={busy}
              className="btn-primary w-full disabled:opacity-60"
            >
              {busy ? "Unsubscribing…" : "Confirm unsubscribe"}
            </button>
          </>
        )}

        {state === "already" && <p className="text-foreground-muted text-sm">You're already unsubscribed. No further emails will be sent.</p>}
        {state === "done" && <p className="text-foreground-muted text-sm">You're unsubscribed. You can re-enable emails any time in your account settings.</p>}
        {state === "invalid" && <p className="text-foreground-muted text-sm">This unsubscribe link is invalid or has expired.</p>}
        {state === "error" && <p className="text-foreground-muted text-sm">Something went wrong. Please try again shortly.</p>}

        <a href="/" className="inline-block text-xs uppercase tracking-[0.18em] text-foreground-muted hover:text-bone">
          Back to SEVEN3SEVEN
        </a>
      </div>
    </main>
  );
}
