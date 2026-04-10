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
import { getPublishedProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import type { HomeFeatureIcon } from "@/lib/site-settings-schema";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const HOME_ICON_MAP: Record<HomeFeatureIcon, typeof Zap> = {
  zap: Zap,
  "shield-check": ShieldCheck,
  download: Download,
  headphones: Headphones,
  gamepad: Gamepad2,
  bitcoin: Bitcoin,
  shield: Shield,
};

export default async function HomePage() {
  const settings = (await getSiteSettings()).home;
  const products = await getPublishedProducts();
  const product = products[0] || null;
  const shopHref = product ? `/shop/${product.slug}` : "/shop";
  const priceLabel = product ? `$${product.price.toFixed(0)}` : null;

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <Gamepad2 size={14} />
              {settings.heroBadgeLabel}
            </span>
            <h1 className={styles.heroTitle}>{settings.heroTitle}</h1>
            <p className={styles.heroTagline}>{settings.heroTagline}</p>
            <p className={styles.heroSub}>{settings.heroSubtitle}</p>
            <div className={styles.heroPrice}>
              {priceLabel ? (
                <>
                  <span className={styles.priceTag}>{priceLabel}</span>
                  <span className={styles.priceNote}>Instant delivery - Crypto accepted</span>
                </>
              ) : (
                <span className={styles.priceNote}>{settings.emptyCatalogNote}</span>
              )}
            </div>
            <div className={styles.heroCtas}>
              <Link href={shopHref}>
                <Button size="lg">
                  <ShoppingCart size={18} />
                  {product ? "Buy Now" : "Browse Shop"}
                </Button>
              </Link>
              <Link href={shopHref} className={styles.heroSecondary}>
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

        <section className={styles.proofBar}>
          <div className={styles.proofInner}>
            {settings.proofStats.map((stat) => (
              <div key={stat.label} className={styles.proofStat}>
                <span className={styles.proofValue}>{stat.value}</span>
                <span className={styles.proofLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{settings.whyTitle}</h2>
          <p className={styles.sectionSub}>{settings.whySubtitle}</p>
          <div className={styles.featureGrid}>
            {settings.features.map((feat) => {
              const Icon = HOME_ICON_MAP[feat.icon];
              return (
                <div key={feat.title} className={styles.featureCard}>
                  <Icon size={24} className={styles.featureIcon} />
                  <span className={styles.featureTitle}>{feat.title}</span>
                  <span className={styles.featureDesc}>{feat.desc}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.section} id="pricing">
          <h2 className={styles.sectionTitle}>{settings.pricingTitle}</h2>
          <p className={styles.sectionSub}>{settings.pricingSubtitle}</p>
          <div className={styles.pricingGrid}>
            <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
              <span className={styles.pricingBadge}>
                {product ? "Available Now" : "Catalog Update"}
              </span>
              <span className={styles.pricingLabel}>
                {product ? product.title : settings.pricingFallbackLabel}
              </span>
              {priceLabel ? (
                <div className={styles.pricingPrice}>
                  <span className={styles.pricingAmount}>{priceLabel}</span>
                  <span className={styles.pricingPeriod}>one-time</span>
                </div>
              ) : (
                <div className={styles.pricingPrice}>
                  <span className={styles.pricingPeriod}>Check the shop for live products</span>
                </div>
              )}
              <p className={styles.pricingDesc}>
                {product
                  ? product.shortDescription
                  : settings.pricingFallbackDescription}
              </p>
              <ul className={styles.pricingFeatures}>
                {settings.pricingFeatures.map((feature) => (
                  <li key={feature}>
                    <Check size={16} /> {feature}
                  </li>
                ))}
              </ul>
              <Link href={shopHref} style={{ width: "100%" }}>
                <Button size="lg" style={{ width: "100%" }}>
                  {product ? "Buy Now" : "Open Shop"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{settings.stepsTitle}</h2>
          <p className={styles.sectionSub}>{settings.stepsSubtitle}</p>
          <div className={styles.steps}>
            {settings.steps.map((step) => (
              <div key={step.num} className={styles.step}>
                <span className={styles.stepNum}>{step.num}</span>
                <span className={styles.stepTitle}>{step.title}</span>
                <span className={styles.stepDesc}>{step.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{settings.protectionTitle}</h2>
          <p className={styles.sectionSub}>{settings.protectionSubtitle}</p>
          <div className={styles.trustGrid}>
            {settings.trustCards.map((card) => {
              const Icon = HOME_ICON_MAP[card.icon];
              return (
                <div key={card.title} className={styles.trustCard}>
                  <Icon size={28} className={styles.trustIcon} />
                  <span className={styles.trustTitle}>{card.title}</span>
                  <span className={styles.trustDesc}>{card.desc}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.ctaBanner}>
            <Gamepad2 size={32} style={{ color: "var(--accent)" }} />
            <h2 className={styles.ctaTitle}>{settings.ctaTitle}</h2>
            <p className={styles.ctaDesc}>
              {product
                ? `Get ArcWay now - helper and money maker with full ID refresh for ${priceLabel}.`
                : settings.ctaDescription}
            </p>
            <Link href={shopHref}>
              <Button size="lg">
                <ShoppingCart size={18} />
                {product ? "Buy Now" : "Browse Shop"}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
