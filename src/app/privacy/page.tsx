import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - GoblinLooter",
  description:
    "Privacy policy explaining how GoblinLooter collects, uses, and protects your information.",
};

const sections = [
  {
    title: "Information We Collect",
    bullets: [
      "Account details such as your email address, username, and encrypted authentication data.",
      "Order information such as purchased products, payment status, and delivery records.",
      "Support messages and account activity needed to operate, secure, and improve the service.",
    ],
  },
  {
    title: "How We Use Information",
    bullets: [
      "To create and manage your account.",
      "To process orders, deliver products, and provide support.",
      "To detect fraud, abuse, security incidents, and policy violations.",
      "To maintain business records and comply with legal obligations.",
    ],
  },
  {
    title: "Payments",
    paragraphs: [
      "Cryptocurrency payments are processed through our payment infrastructure and related providers. We keep transaction details required to confirm payment, fulfill orders, and handle disputes or refunds.",
      "We do not store your private wallet keys.",
    ],
  },
  {
    title: "Sharing of Information",
    paragraphs: [
      "We do not sell your personal information. We may share limited information with service providers or infrastructure partners only when needed to operate the site, process payments, or comply with the law.",
    ],
  },
  {
    title: "Retention and Security",
    paragraphs: [
      "We retain information for as long as needed to provide the service, maintain records, resolve disputes, and meet legal requirements.",
      "We use reasonable administrative and technical measures to protect stored information, but no system can guarantee absolute security.",
    ],
  },
  {
    title: "Your Choices",
    bullets: [
      "You can review order history and account details from your account area.",
      "You can contact support to request help with account access or privacy-related questions.",
      "If local law grants you additional privacy rights, we will review and respond to valid requests as required.",
    ],
  },
  {
    title: "Policy Updates",
    paragraphs: [
      "We may update this Privacy Policy from time to time. The latest version will always be posted on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How we collect, use, and protect account and order information."
      sections={sections}
      ctaDescription="Questions about privacy or account data can be sent to our support team."
      ctaHref="/support"
      ctaLabel="Contact Support"
    />
  );
}
