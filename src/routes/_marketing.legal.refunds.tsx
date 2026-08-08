import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://737trg.com";

export const Route = createFileRoute("/_marketing/legal/refunds")({
  component: RefundsPage,
  head: () => ({
    meta: [
      { title: "Refund Policy — SEVEN3SEVEN" },
      {
        name: "description",
        content:
          "Refund terms for SEVEN3SEVEN digital training programmes, including how to request a review within 7 days of purchase.",
      },
      { property: "og:title", content: "Refund Policy — SEVEN3SEVEN" },
      {
        property: "og:description",
        content: "Refund terms for SEVEN3SEVEN digital training programmes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/legal/refunds` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/legal/refunds` }],
  }),
});

function RefundsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-24 lg:py-32 space-y-8">
      <p className="eyebrow">Legal</p>
      <h1 className="font-display font-bold text-bone text-4xl lg:text-6xl tracking-[-0.03em] leading-[0.95]">
        Refund Policy
      </h1>
      <div className="prose prose-invert prose-sm max-w-none text-foreground-muted space-y-4">
        <p>SEVEN3SEVEN programmes are digital products. Because access is granted instantly and cannot be returned, all sales are final.</p>
        <p>If you have not accessed the programme and believe you are entitled to a refund, contact us within 7 days of purchase and we will review your request on a case-by-case basis.</p>
        <p>Where a refund is approved, your entitlement will be revoked and the funds returned to your original payment method.</p>
      </div>
    </div>
  );
}