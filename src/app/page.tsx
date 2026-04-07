import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  Shield,
  ArrowRight,
  Gamepad2,
  Download,
  Headphones,
  ShoppingCart,
  Check,
  Bitcoin,
} from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import styles from "./page.module.css";

export default function HomePage() {
  const regular = MOCK_PRODUCTS[0];
  const refresh = MOCK_PRODUCTS[1];

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        {/* ─── Hero ─── */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <Gamepad2 size={14} />
              Arc Raiders
            </span>
            <h1 className={styles.heroTitle}>
              ArcWay
            </h1>
            <p className={styles.heroTagline}>Helper &amp; Money Maker</p>
            <p className={styles.heroSub}>
              The ultimate Arc Raiders tool — fast, undetected, and
              regularly updated with every game patch.
            </p>
            <div className={styles.heroPrice}>
              <span className={styles.priceTag}>From $35</span>
              <span className={styles.priceNote}>Instant delivery · Crypto accepted</span>
            </div>
            <div className={styles.heroCtas}>
              <Link href="#pricing">
                <Button size="lg">
                  <ShoppingCart size={18} />
                  View Pricing
                </Button>
              </Link>
              <Link href={`/shop/${regular.slug}`} className={styles.heroSecondary}>
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="/arcway-dupe.png"
              alt="ArcWay"
              width={560}
              height={315}
              className={styles.heroImg}
              priority
            />
            <div className={styles.heroGlow} />
          </div>
        </section>

        {/* ─── Social proof ─── */}
        <section className={styles.proofBar}>
          <div className={styles.proofInner}>
            {[
              { value: "500+", label: "Active Users" },
              { value: "99.8%", label: "Uptime" },
              { value: "Instant", label: "Delivery" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className={styles.proofStat}>
                <span className={styles.proofValue}>{stat.value}</span>
                <span className={styles.proofLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why ArcWay?</h2>
          <p className={styles.sectionSub}>
            Built from the ground up for Arc Raiders players who want an edge.
          </p>
          <div className={styles.featureGrid}>
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Maximize your earnings in seconds with our optimized engine. No lag, no delays.",
              },
              {
                icon: ShieldCheck,
                title: "Undetected",
                desc: "Advanced anti-detection keeps you safe. Updated within hours of every game patch.",
              },
              {
                icon: Download,
                title: "Instant Delivery",
                desc: "Get your license key immediately after purchase. Start earning in under 5 minutes.",
              },
              {
                icon: Headphones,
                title: "Dedicated Support",
                desc: "Real humans helping you 24/7. Setup guides, troubleshooting, and priority assistance.",
              },
              {
                icon: Gamepad2,
                title: "Clean Overlay",
                desc: "Minimal, non-intrusive overlay that stays out of your way while you play.",
              },
              {
                icon: Bitcoin,
                title: "Crypto Payments",
                desc: "Pay with Bitcoin and other cryptocurrencies via our secure BTCPay checkout.",
              },
            ].map((feat) => (
              <div key={feat.title} className={styles.featureCard}>
                <feat.icon size={24} className={styles.featureIcon} />
                <span className={styles.featureTitle}>{feat.title}</span>
                <span className={styles.featureDesc}>{feat.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className={styles.section} id="pricing">
          <h2 className={styles.sectionTitle}>Choose your plan</h2>
          <p className={styles.sectionSub}>
            Two tiers to fit your needs. Both include lifetime updates and support.
          </p>
          <div className={styles.pricingGrid}>
            {/* Regular */}
            <div className={styles.pricingCard}>
              <span className={styles.pricingLabel}>Regular</span>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>$35</span>
                <span className={styles.pricingPeriod}>one-time</span>
              </div>
              <p className={styles.pricingDesc}>
                Full ArcWay helper and money maker access for Arc Raiders.
              </p>
              <ul className={styles.pricingFeatures}>
                <li><Check size={16} /> Full tool access</li>
                <li><Check size={16} /> Anti-detection</li>
                <li><Check size={16} /> Auto-updates</li>
                <li><Check size={16} /> Clean overlay</li>
                <li><Check size={16} /> 24/7 support</li>
              </ul>
              <Link href={`/shop/${regular.slug}`} style={{ width: "100%" }}>
                <Button size="lg" variant="secondary" style={{ width: "100%" }}>
                  Get Regular
                </Button>
              </Link>
            </div>

            {/* Refresh All IDs */}
            <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
              <span className={styles.pricingBadge}>Most Popular</span>
              <span className={styles.pricingLabel}>Refresh All IDs</span>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>$60</span>
                <span className={styles.pricingPeriod}>one-time</span>
              </div>
              <p className={styles.pricingDesc}>
                Everything in Regular plus a complete identity refresh for a clean slate.
              </p>
              <ul className={styles.pricingFeatures}>
                <li><Check size={16} /> Everything in Regular</li>
                <li><Check size={16} /> Full hardware ID refresh</li>
                <li><Check size={16} /> Software ID refresh</li>
                <li><Check size={16} /> Clean slate start</li>
                <li><Check size={16} /> Priority support</li>
                <li><Check size={16} /> Same-day setup help</li>
              </ul>
              <Link href={`/shop/${refresh.slug}`} style={{ width: "100%" }}>
                <Button size="lg" style={{ width: "100%" }}>
                  Get Refresh All IDs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionSub}>
            Three simple steps to get started.
          </p>
          <div className={styles.steps}>
            {[
              {
                num: 1,
                title: "Purchase",
                desc: "Choose your plan and pay securely with crypto or other methods.",
              },
              {
                num: 2,
                title: "Activate",
                desc: "Receive your key instantly and activate it in the ArcWay loader.",
              },
              {
                num: 3,
                title: "Dominate",
                desc: "Launch Arc Raiders and start making money with the clean overlay.",
              },
            ].map((step) => (
              <div key={step.num} className={styles.step}>
                <span className={styles.stepNum}>{step.num}</span>
                <span className={styles.stepTitle}>{step.title}</span>
                <span className={styles.stepDesc}>{step.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Trust block ─── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your purchase is protected</h2>
          <p className={styles.sectionSub}>
            Every transaction is backed by our commitment to quality and security.
          </p>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <ShieldCheck size={28} className={styles.trustIcon} />
              <span className={styles.trustTitle}>Secure Payments</span>
              <span className={styles.trustDesc}>
                Pay with Bitcoin via BTCPay Server — fully self-hosted, non-custodial, 
                and private. Your payment goes directly to us.
              </span>
            </div>
            <div className={styles.trustCard}>
              <Zap size={28} className={styles.trustIcon} />
              <span className={styles.trustTitle}>Instant Delivery</span>
              <span className={styles.trustDesc}>
                Your license key is delivered within seconds of payment
                confirmation. No waiting around.
              </span>
            </div>
            <div className={styles.trustCard}>
              <Shield size={28} className={styles.trustIcon} />
              <span className={styles.trustTitle}>Buyer Protection</span>
              <span className={styles.trustDesc}>
                Not satisfied? 72-hour refund window on unredeemed keys.
                Contact our support team anytime.
              </span>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className={styles.section}>
          <div className={styles.ctaBanner}>
            <Gamepad2 size={32} style={{ color: "var(--accent)" }} />
            <h2 className={styles.ctaTitle}>Ready to dominate Arc Raiders?</h2>
            <p className={styles.ctaDesc}>
              Get ArcWay now — helper and money maker, starting at $35.
            </p>
            <Link href="#pricing">
              <Button size="lg">
                <ShoppingCart size={18} />
                Choose Your Plan
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
