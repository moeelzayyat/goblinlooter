import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Shield,
  ArrowRight,
  Key,
  Wrench,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/data/ProductCard";
import { ContentGrid } from "@/components/layout/ContentGrid";
import { MOCK_PRODUCTS, CATEGORIES } from "@/lib/mockData";
import styles from "./page.module.css";

const CATEGORY_ICONS: Record<string, typeof Key> = {
  "game-keys": Key,
  "tool-access": Wrench,
  configs: Settings2,
};

export default function HomePage() {
  const featured = MOCK_PRODUCTS.filter((p) => p.featured).slice(0, 4);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        {/* ─── Hero ─── */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Premium game tools, delivered fast.
          </h1>
          <p className={styles.heroSub}>
            Hand-picked digital products for serious gamers. Secure checkout,
            fast delivery, real support.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/shop">
              <Button size="lg">Browse the Shop</Button>
            </Link>
          </div>
        </section>

        {/* ─── Social proof ─── */}
        <section className={styles.proofBar}>
          <div className={styles.proofInner}>
            {[
              { value: "5,000+", label: "Products Delivered" },
              { value: "99.8%", label: "Delivery Success" },
              { value: "Fast", label: "Digital Delivery" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className={styles.proofStat}>
                <span className={styles.proofValue}>{stat.value}</span>
                <span className={styles.proofLabel}>{stat.label}</span>
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
                title: "Browse",
                desc: "Explore our curated catalog of game keys, tools, and configs.",
              },
              {
                num: 2,
                title: "Purchase",
                desc: "Pay securely with your preferred payment method.",
              },
              {
                num: 3,
                title: "Receive",
                desc: "Your product is delivered to your account, typically within seconds.",
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

        {/* ─── Featured products ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Popular right now</h2>
            </div>
            <Link href="/shop" className={styles.viewAll}>
              View all →
            </Link>
          </div>
          <ContentGrid columns={4}>
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ContentGrid>
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
              <span className={styles.trustTitle}>Fast Delivery</span>
              <span className={styles.trustDesc}>
                Most products deliver within seconds of payment confirmation.
                Occasionally, orders go through a brief security review.
              </span>
            </div>
            <div className={styles.trustCard}>
              <Shield size={28} className={styles.trustIcon} />
              <span className={styles.trustTitle}>Buyer Protection</span>
              <span className={styles.trustDesc}>
                Not satisfied? Contact our support team — we handle every issue
                personally and stand behind our products.
              </span>
            </div>
          </div>
        </section>

        {/* ─── Category discovery ─── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Browse by category</h2>
          <p className={styles.sectionSub}>
            Find exactly what you&apos;re looking for.
          </p>
          <div className={styles.catGrid}>
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Key;
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className={styles.catTile}
                >
                  <Icon size={24} className={styles.catIcon} />
                  <div className={styles.catInfo}>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.catCount}>{cat.count} products</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className={styles.section}>
          <div className={styles.ctaBanner}>
            <TrendingUp size={32} style={{ color: "var(--accent)" }} />
            <h2 className={styles.ctaTitle}>Ready to gear up?</h2>
            <p className={styles.ctaDesc}>
              Browse our catalog and find exactly what you need.
            </p>
            <Link href="/shop">
              <Button size="lg">Shop Now</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
