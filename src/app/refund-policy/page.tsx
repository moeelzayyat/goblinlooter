import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy - GoblinLooter",
  description:
    "Our refund policy for digital products purchased on GoblinLooter.",
};

const sections = [
  {
    title: "Overview",
    paragraphs: [
      "We want you to be satisfied with every purchase. Because we sell digital products that are delivered instantly, our refund policy has specific conditions. Please review this policy before making a purchase.",
    ],
  },
  {
    title: "Eligible Refunds",
    bullets: [
      "Unredeemed keys: If your product key has not been activated or redeemed, you may request a full refund within 72 hours of purchase.",
      "Non-working keys: If you receive a key that does not work, we will provide a replacement or a full refund.",
      "Delivery failure: If your product is not delivered within the estimated timeframe and our team cannot resolve the issue, you are entitled to a full refund.",
    ],
  },
  {
    title: "Non-Refundable Conditions",
    bullets: [
      "Keys that have been activated or redeemed.",
      "Requests made more than 72 hours after purchase unless the product was defective.",
      "Orders flagged for fraud or terms of service violations.",
    ],
  },
  {
    title: "How to Request a Refund",
    orderedBullets: [
      "Go to your Orders page and find the purchase.",
      'Click "Contact Support" on the order detail page.',
      "Describe the issue and our team will review it within 48 hours.",
    ],
  },
  {
    title: "Refund Processing",
    paragraphs: [
      "Approved refunds for cryptocurrency payments are processed within 24 hours. You will need to provide a wallet address for the refund. Refunds are issued in the same cryptocurrency used for the original purchase, such as BTC or LTC.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      subtitle="Conditions for refunds, replacements, and support for digital purchases."
      sections={sections}
      ctaDescription="Have questions about your purchase? We are here to help."
      ctaHref="/support"
      ctaLabel="Contact Support"
    />
  );
}
