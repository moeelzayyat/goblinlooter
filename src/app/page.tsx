import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  Users,
  ArrowRight,
  Gamepad2,
  Code2,
  Settings2,
  UserCircle2,
  Boxes,
  Wrench,
  ShoppingBag,
  Clock,
  TrendingUp,
  ThumbsUp,
} from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/data/ProductCard";
import { ContentGrid } from "@/components/layout/ContentGrid";
import { MOCK_PRODUCTS, CATEGORIES } from "@/lib/mockData";
import styles from "./page.module.css";

const CATEGORY_ICONS: Record<string, typeof Gamepad2> = {
  "game-tools": Gamepad2,
  scripts: Code2,
  configs: Settings2,
  accounts: UserCircle2,
  items: Boxes,
  services: Wrench,
};

export default function HomePage() {
  const featured = MOCK_PRODUCTS.slice(0, 4);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        {/* ─── Hero ─── */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Game tools and trading, done right.
          </h1>
          <p className={styles.heroSub}>
            Buy, sell, and trade game tools with verified sellers and secure
            transactions.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/browse">
              <Button size="lg">Browse Marketplace</Button>
            </Link>
            <Link href="/dashboard" className={styles.heroSecondary}>
              Start selling <ArrowRight size={16} style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
          </div>
        </section>

        {/* ─── Social proof ─── */}
        <section className={styles.proofBar}>
          <div className={styles.proofInner}>
            {[
              { icon: Users, value: "10,000+", label: "Active Users" },
              { icon: ShoppingBag, value: "25,000+", label: "Transactions" },
              { icon: ThumbsUp, value: "98.5%", label: "Seller Satisfaction" },
              { icon: Clock, value: "< 5 min", label: "Avg. Delivery" },
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
                desc: "Find tools, scripts, configs, and more from verified sellers.",
              },
              {
                num: 2,
                title: "Purchase",
                desc: "Pay securely with escrow protection on every transaction.",
              },
              {
                num: 3,
                title: "Receive",
                desc: "Get instant delivery and start using your tools right away.",
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

        {/* ─── Featured listings ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Popular right now</h2>
            </div>
            <Link href="/browse" className={styles.viewAll}>
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
          <h2 className={styles.sectionTitle}>Your safety matters</h2>
          <p className={styles.sectionSub}>
            Every transaction is protected by our trust and safety systems.
          </p>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <ShieldCheck size={28} className={styles.trustIcon} />
              <span className={styles.trustTitle}>Escrow Protection</span>
              <span className={styles.trustDesc}>
                Funds are held securely until you confirm delivery. No payment
                is released until you&apos;re satisfied.
              </span>
            </div>
            <div className={styles.trustCard}>
              <Users size={28} className={styles.trustIcon} />
              <span className={styles.trustTitle}>Verified Sellers</span>
              <span className={styles.trustDesc}>
                Multi-step verification for sellers including identity checks.
                Look for the verified badge on listings.
              </span>
            </div>
            <div className={styles.trustCard}>
              <Scale size={28} className={styles.trustIcon} />
              <span className={styles.trustTitle}>Dispute Resolution</span>
              <span className={styles.trustDesc}>
                If something goes wrong, our dispute team reviews evidence from
                both parties and ensures a fair outcome.
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
              const Icon = CATEGORY_ICONS[cat.id] || Boxes;
              return (
                <Link
                  key={cat.id}
                  href={`/browse?category=${cat.id}`}
                  className={styles.catTile}
                >
                  <Icon size={24} className={styles.catIcon} />
                  <div className={styles.catInfo}>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.catCount}>{cat.count} items</span>
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
            <h2 className={styles.ctaTitle}>Ready to start?</h2>
            <p className={styles.ctaDesc}>
              Join thousands of gamers buying and selling tools on GoblinLooter.
            </p>
            <Link href="/auth/register">
              <Button size="lg">Create Your Account</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
