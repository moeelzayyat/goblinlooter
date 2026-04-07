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
} from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import styles from "./page.module.css";

export default function HomePage() {
  const product = MOCK_PRODUCTS[0];

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
              ArcWay Dupe
            </h1>
            <p className={styles.heroSub}>
              Premium duplication tool for Arc Raiders — fast, undetected, and
              regularly updated with every game patch.
            </p>
            <div className={styles.heroPrice}>
              <span className={styles.priceTag}>${product.price.toFixed(2)}</span>
              <span className={styles.priceNote}>One-time purchase · Instant delivery</span>
            </div>
            <div className={styles.heroCtas}>
              <Link href={`/shop/${product.slug}`}>
                <Button size="lg">
                  <ShoppingCart size={18} />
                  Get ArcWay Dupe
                </Button>
              </Link>
              <Link href={`/shop/${product.slug}`} className={styles.heroSecondary}>
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="/arcway-dupe.png"
              alt="ArcWay Dupe"
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
          <h2 className={styles.sectionTitle}>Why ArcWay Dupe?</h2>
          <p className={styles.sectionSub}>
            Built from the ground up for Arc Raiders players who want an edge.
          </p>
          <div className={styles.featureGrid}>
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Dupe items in seconds with our optimized memory engine. No lag, no delays.",
              },
              {
                icon: ShieldCheck,
                title: "Undetected",
                desc: "Advanced anti-detection keeps you safe. Updated within hours of every game patch.",
              },
              {
                icon: Download,
                title: "Instant Delivery",
                desc: "Get your license key immediately after purchase. Start duping in under 5 minutes.",
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
                icon: Shield,
                title: "Buyer Protection",
                desc: "72-hour refund window on unredeemed keys. We stand behind our product.",
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
                desc: "Buy your ArcWay Dupe license key securely through our checkout.",
              },
              {
                num: 2,
                title: "Activate",
                desc: "Receive your key instantly and activate it in the ArcWay loader.",
              },
              {
                num: 3,
                title: "Dominate",
                desc: "Launch Arc Raiders and start duping items with the clean overlay.",
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
                Industry-standard encryption on every transaction. Your payment
                details never touch our servers.
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
              Get ArcWay Dupe now and start duping items instantly.
            </p>
            <Link href={`/shop/${product.slug}`}>
              <Button size="lg">
                <ShoppingCart size={18} />
                Get it for ${product.price.toFixed(2)}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
