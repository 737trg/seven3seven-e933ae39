import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://737trg.com";

export const Route = createFileRoute("/_marketing/legal/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — SEVEN3SEVEN" },
      {
        name: "description",
        content:
          "How SEVEN3SEVEN collects, uses and stores your data when you buy and follow a hybrid training programme.",
      },
      { property: "og:title", content: "Privacy Policy — SEVEN3SEVEN" },
      {
        property: "og:description",
        content: "How SEVEN3SEVEN handles your account and payment data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/legal/privacy` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/legal/privacy` }],
  }),
});

function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-24 lg:py-32 space-y-8">
      <p className="eyebrow">Legal</p>
      <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl tracking-[-0.03em] leading-[0.95]">
        Privacy Policy
      </h1>
      <div className="prose prose-invert prose-sm max-w-none text-foreground-muted space-y-4">
        <p>We collect only what is required to deliver your training programme and process your payment: your email address, account credentials, and Stripe payment metadata.</p>
        <h2 className="text-bone">Payments</h2>
        <p>Payment processing is handled by Stripe. Card numbers never touch our servers.</p>
        <h2 className="text-bone">Data requests</h2>
        <p>Contact us to request export or deletion of your data.</p>
      </div>
    </div>
  );
}