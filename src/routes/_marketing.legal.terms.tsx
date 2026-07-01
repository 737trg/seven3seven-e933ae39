import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/legal/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — SEVEN3SEVEN" },
      { name: "description", content: "SEVEN3SEVEN terms of service and purchase terms." },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-24 lg:py-32 space-y-8">
      <p className="eyebrow">Legal</p>
      <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl tracking-[-0.03em] leading-[0.95]">
        Terms of Service
      </h1>
      <div className="prose prose-invert prose-sm max-w-none text-foreground-muted space-y-4">
        <p>These terms govern your purchase and use of SEVEN3SEVEN training programmes. By purchasing you agree to be bound by these terms.</p>
        <h2 className="text-bone">Digital products</h2>
        <p>All programmes are digital products delivered instantly upon completion of payment. Access is lifetime for the version of the programme you purchase.</p>
        <h2 className="text-bone">Health disclaimer</h2>
        <p>SEVEN3SEVEN programmes are for informational purposes. Consult a qualified medical professional before beginning any training programme.</p>
        <h2 className="text-bone">Payments</h2>
        <p>Payments are processed securely by Stripe. We never store card details on our servers.</p>
        <p className="text-xs text-foreground-muted/60">Last updated: {new Date().getFullYear()}.</p>
      </div>
    </div>
  );
}