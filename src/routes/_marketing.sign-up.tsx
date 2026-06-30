import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/sign-up")({
  head: () => ({
    meta: [
      { title: "Sign up — SEVEN3SEVEN" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Authentication is not yet active for SEVEN3SEVEN." },
    ],
  }),
  component: AuthStub,
});

function AuthStub() {
  return (
    <section className="min-h-[60vh] grid place-items-center px-5">
      <div className="max-w-md w-full text-center border border-border p-10 rounded-[2px]">
        <p className="eyebrow text-signal mb-3">Coming soon</p>
        <h1 className="font-display font-bold text-bone text-3xl tracking-tight uppercase">
          Sign up
        </h1>
        <p className="text-foreground-muted text-sm mt-4">
          Accounts launch with the first programmes. Until then, no sign-in is required.
        </p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 eyebrow text-signal">
          Back to home
        </Link>
      </div>
    </section>
  );
}
