export type SiteSettingKey = "home" | "shop" | "support" | "footer" | "legal";

export type HomeFeatureIcon =
  | "zap"
  | "shield-check"
  | "download"
  | "headphones"
  | "gamepad"
  | "bitcoin"
  | "shield";

export type SupportCategoryIcon =
  | "book-open"
  | "shopping-cart"
  | "zap"
  | "refresh-cw"
  | "user-cog";

export type FooterSocialIcon = "globe" | "message-circle" | "external-link";

export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteFooterColumn {
  title: string;
  links: SiteLink[];
}

export interface SiteFooterSocialLink extends SiteLink {
  icon: FooterSocialIcon;
}

export interface HomeStat {
  value: string;
  label: string;
}

export interface HomeFeature {
  icon: HomeFeatureIcon;
  title: string;
  desc: string;
}

export interface HomeStep {
  num: number;
  title: string;
  desc: string;
}

export interface SupportFaq {
  q: string;
  a: string;
}

export interface SupportCategory {
  id: string;
  name: string;
  icon: SupportCategoryIcon;
  faqs: SupportFaq[];
}

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  orderedBullets?: string[];
}

export interface LegalPageSettings {
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  ctaDescription: string;
  ctaHref: string;
  ctaLabel: string;
  sections: LegalSection[];
}

export interface HomeSettings {
  heroBadgeLabel: string;
  heroTitle: string;
  heroTagline: string;
  heroSubtitle: string;
  emptyCatalogNote: string;
  proofStats: HomeStat[];
  whyTitle: string;
  whySubtitle: string;
  features: HomeFeature[];
  pricingTitle: string;
  pricingSubtitle: string;
  pricingFallbackLabel: string;
  pricingFallbackDescription: string;
  pricingFeatures: string[];
  stepsTitle: string;
  stepsSubtitle: string;
  steps: HomeStep[];
  protectionTitle: string;
  protectionSubtitle: string;
  trustCards: HomeFeature[];
  ctaTitle: string;
  ctaDescription: string;
}

export interface ShopSettings {
  title: string;
  subtitle: string;
  emptyStateMessage: string;
  emptyStateDescription: string;
}

export interface SupportSettings {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  contactTitle: string;
  contactSubjectLabel: string;
  contactSubjectPlaceholder: string;
  contactMessageLabel: string;
  contactMessagePlaceholder: string;
  contactSubmitLabel: string;
  contactSuccessMessage: string;
  contactLoggedOutHint: string;
  categories: SupportCategory[];
}

export interface FooterSettings {
  brandName: string;
  brandTagline: string;
  copyrightNotice: string;
  columns: SiteFooterColumn[];
  socials: SiteFooterSocialLink[];
}

export interface LegalSettings {
  refundPolicy: LegalPageSettings;
  terms: LegalPageSettings;
  privacy: LegalPageSettings;
}

export interface SiteSettingsBundle {
  home: HomeSettings;
  shop: ShopSettings;
  support: SupportSettings;
  footer: FooterSettings;
  legal: LegalSettings;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsBundle = {
  home: {
    heroBadgeLabel: "Arc Raiders",
    heroTitle: "ArcWay Services",
    heroTagline: "Gaming Tools & Support",
    heroSubtitle:
      "Premium Arc Raiders gaming tools, setup resources, and support delivered fast.",
    emptyCatalogNote:
      "The catalog is being updated. Visit the shop for current availability.",
    proofStats: [
      { value: "500+", label: "Active Users" },
      { value: "99.8%", label: "Uptime" },
      { value: "Instant", label: "Delivery" },
      { value: "24/7", label: "Support" },
    ],
    whyTitle: "Why ArcWay Services?",
    whySubtitle:
      "Built for Arc Raiders players who want reliable gaming tools and support.",
    features: [
      {
        icon: "zap",
        title: "Lightning Fast",
        desc: "Access setup resources quickly with a streamlined delivery flow. No lag, no delays.",
      },
      {
        icon: "shield-check",
        title: "Reliable Updates",
        desc: "Maintained with game updates and clear compatibility notes for supported builds.",
      },
      {
        icon: "download",
        title: "Instant Delivery",
        desc: "Get your digital access immediately after purchase and start setup in minutes.",
      },
      {
        icon: "headphones",
        title: "Dedicated Support",
        desc: "Real humans helping you 24/7. Setup guides, troubleshooting, and priority assistance.",
      },
      {
        icon: "gamepad",
        title: "Clean Overlay",
        desc: "Minimal, non-intrusive overlay that stays out of your way while you play.",
      },
      {
        icon: "bitcoin",
        title: "Flexible Payments",
        desc: "Pay securely with cards, Cash App Pay, or supported cryptocurrency checkout.",
      },
    ],
    pricingTitle: "Get ArcWay Services",
    pricingSubtitle:
      "One premium package with lifetime updates, instant delivery, and priority support.",
    pricingFallbackLabel: "Catalog update in progress",
    pricingFallbackDescription:
      "Publish a product from the admin panel and it will appear here automatically.",
    pricingFeatures: [
      "Full gaming tool access",
      "Guided setup resources",
      "Compatibility updates",
      "Priority support",
      "Same-day setup help",
    ],
    stepsTitle: "How it works",
    stepsSubtitle: "Three simple steps to get started.",
    steps: [
      {
        num: 1,
        title: "Purchase",
        desc: "Buy the package and pay securely with your preferred supported method.",
      },
      {
        num: 2,
        title: "Activate",
        desc: "Receive access instantly and follow the guided ArcWay setup flow.",
      },
      {
        num: 3,
        title: "Play",
        desc: "Launch Arc Raiders with a clean supported toolset and clear support options.",
      },
    ],
    protectionTitle: "Your purchase is protected",
    protectionSubtitle:
      "Every transaction is backed by our commitment to quality and security.",
    trustCards: [
      {
        icon: "shield-check",
        title: "Secure Payments",
        desc: "Pay through secure hosted checkout with card, Cash App Pay, or supported crypto options.",
      },
      {
        icon: "zap",
        title: "Instant Delivery",
        desc: "Your license key is delivered within seconds of payment confirmation. No waiting around.",
      },
      {
        icon: "shield",
        title: "Buyer Protection",
        desc: "Not satisfied? 72-hour refund window on unredeemed keys. Contact our support team anytime.",
      },
    ],
    ctaTitle: "Ready to upgrade your Arc Raiders setup?",
    ctaDescription:
      "Open the shop to see the latest live offers and delivery options.",
  },
  shop: {
    title: "Shop",
    subtitle:
      "Premium game tools for Arc Raiders - tested, updated, and delivered instantly",
    emptyStateMessage: "No products match your filters",
    emptyStateDescription:
      "Try adjusting your search or filters to find what you're looking for.",
  },
  support: {
    title: "Help Center",
    subtitle: "Find answers or reach out to our team",
    searchPlaceholder: "Search for help...",
    contactTitle: "Still need help?",
    contactSubjectLabel: "Subject",
    contactSubjectPlaceholder: "Brief description of your issue",
    contactMessageLabel: "Message",
    contactMessagePlaceholder: "Describe your issue in detail...",
    contactSubmitLabel: "Send Message",
    contactSuccessMessage: "Message sent! We'll get back to you within 24 hours.",
    contactLoggedOutHint: "Please log in to submit a support ticket.",
    categories: [
      {
        id: "getting-started",
        name: "Getting Started",
        icon: "book-open",
        faqs: [
          {
            q: "How do I create an account?",
            a: "Click the 'Sign Up' button in the top right corner, enter your email and create a password. You'll receive a confirmation email to verify your account.",
          },
          {
            q: "Do I need an account to purchase?",
            a: "Yes, an account is required so you can access your purchased products in your order history at any time.",
          },
        ],
      },
      {
        id: "buying",
        name: "Buying & Payment",
        icon: "shopping-cart",
        faqs: [
          {
            q: "What payment methods are accepted?",
            a: "We accept credit and debit cards, Cash App Pay, Bitcoin (BTC), and Litecoin (LTC) through supported checkout providers.",
          },
          {
            q: "Is my payment secure?",
            a: "Yes. Card and Cash App Pay payments are handled through Stripe Checkout, and crypto payments are handled through BTCPay Server. We do not store card details or private wallet keys.",
          },
        ],
      },
      {
        id: "delivery",
        name: "Delivery",
        icon: "zap",
        faqs: [
          {
            q: "How quickly will I receive my product?",
            a: "Most products are delivered within seconds of payment confirmation. Occasionally, an order may go through a brief security review, which typically resolves within a few minutes.",
          },
          {
            q: "What if my order is under review?",
            a: "Some orders go through a quick security check to protect both you and us. You'll see a status page while this happens, and we'll email you as soon as your product is ready.",
          },
          {
            q: "Where do I find my product key or download?",
            a: "After purchase, your key or download link appears on the confirmation page. You can also access it anytime from My Orders in your account.",
          },
          {
            q: "My key doesn't work. What should I do?",
            a: "Contact our support team immediately using the 'Get help with this order' button on your order detail page. We'll investigate and resolve the issue - usually with a replacement key.",
          },
        ],
      },
      {
        id: "refunds",
        name: "Refunds",
        icon: "refresh-cw",
        faqs: [
          {
            q: "Can I get a refund?",
            a: "Refund eligibility varies by product and is clearly shown on each product page before purchase. Generally, unredeemed keys can be refunded within 72 hours.",
          },
          {
            q: "How do I request a refund?",
            a: "Go to My Orders, find the order, and click 'Contact Support'. Select 'I want a refund' and our team will review your request within 48 hours.",
          },
          {
            q: "How long does a refund take to process?",
            a: "Once approved, refunds are processed back through the original supported payment method whenever possible.",
          },
        ],
      },
      {
        id: "account",
        name: "Account & Security",
        icon: "user-cog",
        faqs: [
          {
            q: "How do I reset my password?",
            a: "Go to the login page and click 'Forgot Password'. Enter your email and follow the instructions in the reset email.",
          },
          {
            q: "How do I change my email address?",
            a: "Go to Account Settings and update your email. You'll need to verify the new email address before the change takes effect.",
          },
        ],
      },
    ],
  },
  footer: {
    brandName: "GoblinLooter",
    brandTagline: "Premium digital game tools - curated, tested, delivered fast.",
    copyrightNotice: "All rights reserved.",
    columns: [
      {
        title: "Shop",
        links: [{ label: "Browse Catalog", href: "/shop" }],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", href: "/support" },
          { label: "Contact Us", href: "/support#contact" },
          { label: "Refund Policy", href: "/refund-policy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
        ],
      },
    ],
    socials: [
      { label: "Website", href: "#", icon: "globe" },
      { label: "Discord", href: "#", icon: "message-circle" },
      { label: "GitHub", href: "#", icon: "external-link" },
    ],
  },
  legal: {
    refundPolicy: {
      metaTitle: "Refund Policy - GoblinLooter",
      metaDescription: "Our refund policy for digital products purchased on GoblinLooter.",
      title: "Refund Policy",
      subtitle: "Conditions for refunds, replacements, and support for digital purchases.",
      ctaDescription: "Have questions about your purchase? We are here to help.",
      ctaHref: "/support",
      ctaLabel: "Contact Support",
      sections: [
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
            "Approved refunds are processed back through the original supported payment method whenever possible. Crypto refunds may require a wallet address from you before processing.",
          ],
        },
      ],
    },
    terms: {
      metaTitle: "Terms of Service - GoblinLooter",
      metaDescription:
        "Terms of service for using GoblinLooter and purchasing digital products.",
      title: "Terms of Service",
      subtitle: "Please review these terms before using the site or making a purchase.",
      ctaDescription:
        "Need clarification before placing an order? Our support team can help.",
      ctaHref: "/support",
      ctaLabel: "Contact Support",
      sections: [
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
            "Payments are accepted through supported checkout methods, including cards, Cash App Pay, BTC, and LTC.",
            "Orders are usually delivered shortly after payment confirmation, but some orders may be delayed for fraud or inventory review.",
            "You are responsible for providing accurate account and contact information at checkout.",
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
      ],
    },
    privacy: {
      metaTitle: "Privacy Policy - GoblinLooter",
      metaDescription:
        "Privacy policy explaining how GoblinLooter collects, uses, and protects your information.",
      title: "Privacy Policy",
      subtitle: "How we collect, use, and protect account and order information.",
      ctaDescription:
        "Questions about privacy or account data can be sent to our support team.",
      ctaHref: "/support",
      ctaLabel: "Contact Support",
      sections: [
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
            "Payments are processed through our payment infrastructure and related providers. We keep transaction details required to confirm payment, fulfill orders, and handle disputes or refunds.",
            "We do not store card details or private wallet keys.",
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
      ],
    },
  },
};
