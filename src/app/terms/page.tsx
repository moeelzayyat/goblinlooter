import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - GoblinLooter",
  description:
    "Terms of service for using GoblinLooter and purchasing digital products.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing GoblinLooter or placing an order, you agree to these Terms of Service and our related policies.",
      "If you do not agree with these terms, please do not use the site or complete a purchase.",
    ],
  },
  {
    title: "Digital Products and Accounts",
    paragraphs: [
      "GoblinLooter sells digital products that are delivered electronically after payment confirmation.",
      "You are responsible for keeping your account credentials secure and for all activity that occurs under your account.",
    ],
  },
  {
    title: "Payments and Delivery",
    bullets: [
      "Payments are accepted in supported cryptocurrencies such as BTC and LTC.",
      "Orders are usually delivered shortly after payment confirmation, but some orders may be delayed for fraud or inventory review.",
      "You are responsible for providing accurate wallet, account, and contact information at checkout.",
    ],
  },
  {
    title: "Acceptable Use",
    bullets: [
      "Do not use the site for unlawful, fraudulent, or abusive activity.",
      "Do not attempt to interfere with the platform, payment flow, or another user's account.",
      "Do not redistribute, resell, or misuse digital products when prohibited by the product listing or applicable law.",
    ],
  },
  {
    title: "Refunds",
    paragraphs: [
      "Refunds are handled according to our Refund Policy. Product-specific refund eligibility is shown on product pages when applicable.",
      "Activated, redeemed, or otherwise consumed digital goods are generally not eligible for refunds unless required by law.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, GoblinLooter is not liable for indirect, incidental, special, or consequential damages arising from use of the site or purchased products.",
      "Our total liability for a claim related to an order will not exceed the amount you paid for that order.",
    ],
  },
  {
    title: "Changes and Contact",
    paragraphs: [
      "We may update these terms from time to time by posting a revised version on this page.",
      "If you have questions about these terms, please contact our support team.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Please review these terms before using the site or making a purchase."
      sections={sections}
      ctaDescription="Need clarification before placing an order? Our support team can help."
      ctaHref="/support"
      ctaLabel="Contact Support"
    />
  );
}
