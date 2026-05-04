import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock3,
  Download,
  Gamepad2,
  Headphones,
  PackageCheck,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { getPublishedProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import type { HomeFeatureIcon } from "@/lib/site-settings-schema";
import type { Product } from "@/types";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const HOME_ICON_MAP: Record<HomeFeatureIcon, typeof Zap> = {
  zap: Zap,
  "shield-check": ShieldCheck,
  download: Download,
  headphones: Headphones,
  gamepad: Gamepad2,
  bitcoin: Shield,
  shield: Shield,
};

function getLowestProductPrice(product: Product) {
  return product.purchaseOptions && product.purchaseOptions.length > 0
    ? Math.min(...product.purchaseOptions.map((option) => option.price))
    : product.price;
}

function getProductPriceLabel(product: Product) {
  const lowestPrice = getLowestProductPrice(product);
  const prefix = product.purchaseOptions?.length ? "From " : "";
  return `${prefix}$${lowestPrice.toFixed(2)}`;
}

function getAvailabilityLabel(product: Product) {
  return product.availabilityLabel?.trim() || "Available";
}

function getAvailabilityToneClass(product: Product) {
  switch (product.availabilityTone) {
    case "orange":
      return styles.badgeOrange;
    case "red":
      return styles.badgeRed;
    case "blue":
      return styles.badgeBlue;
    case "gray":
      return styles.badgeGray;
    case "green":
    default:
      return styles.badgeGreen;
  }
}

export default async function HomePage() {
  const settings = (await getSiteSettings()).home;
  const products = await getPublishedProducts();
  const featuredProducts = products.filter((item) => item.featured);
  const storefrontProducts = (featuredProducts.length ? featuredProducts : products).slice(
    0,
    4,
  );
  const primaryProduct = storefrontProducts[0] || null;
  const heroImage = primaryProduct?.images?.[0] || "/arcway-dupe.png";
  const primaryHref = primaryProduct ? `/shop/${primaryProduct.slug}` : "/shop";
  const primaryPriceLabel = primaryProduct
    ? getProductPriceLabel(primaryProduct)
    : null;
  const heroStats = [
    { icon: Clock3, label: "Delivery", value: "Instant" },
    { icon: ShieldCheck, label: "Checkout", value: "Secure" },
    { icon: Headphones, label: "Support", value: "Discord" },
  ];

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.heroBadge}>
              <Sparkles size={14} />
              {settings.heroBadgeLabel}
            </span>
            <h1 className={styles.heroTitle}>{settings.heroTitle}</h1>
            <p className={styles.heroTagline}>{settings.heroTagline}</p>
            <p className={styles.heroSub}>{settings.heroSubtitle}</p>

            <div className={styles.heroActions}>
              <Link href="/shop">
                <Button size="lg">
                  <ShoppingCart size={18} />
                  Shop Digital Resources
                </Button>
              </Link>
              <a
                href="https://discord.gg/arcway"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryAction}
              >
                Join Discord <ArrowRight size={14} />
              </a>
            </div>

            <div className={styles.heroStats} aria-label="Store highlights">
              {heroStats.map(({ icon: Icon, label, value }) => (
                <div key={label} className={styles.heroStat}>
                  <Icon size={16} />
                  <span>
                    <b>{value}</b>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.productPreviewHeader}>
              <span>Featured access</span>
              {primaryPriceLabel && <b>{primaryPriceLabel}</b>}
            </div>
            <Link href={primaryHref} className={styles.heroImageLink}>
              <Image
                src={heroImage}
                alt={primaryProduct?.title || "GoblinLooter digital resources"}
                width={1984}
                height={793}
                className={styles.heroImage}
                priority
              />
            </Link>
            <div className={styles.productPreviewFooter}>
              <div>
                <span>{primaryProduct ? "Digital Service" : "Catalog"}</span>
                <strong>{primaryProduct?.title || "Live products updating"}</strong>
              </div>
              <Link href={primaryHref} className={styles.previewLink}>
                View <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.proofBand} aria-label="Store proof">
          {settings.proofStats.map((stat) => (
            <div key={stat.label} className={styles.proofItem}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Catalog</span>
            <h2>Featured Digital Resources</h2>
            <p>
              Pick a product, choose the duration or access option, and receive
              your key, download, and setup guide after checkout.
            </p>
          </div>

          {storefrontProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {storefrontProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/${item.slug}`}
                  className={styles.productCard}
                >
                  <div className={styles.productImageWrap}>
                    <Image
                      src={item.images[0] || "/arcway-dupe.png"}
                      alt={item.title}
                      width={900}
                      height={500}
                      className={styles.productImage}
                    />
                  </div>
                  <div className={styles.productMeta}>
                    <span>Digital Service</span>
                    <b className={getAvailabilityToneClass(item)}>
                      {getAvailabilityLabel(item)}
                    </b>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.shortDescription}</p>
                  <div className={styles.productFooter}>
                    <strong>{getProductPriceLabel(item)}</strong>
                    <span>
                      View product <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyCatalog}>
              <PackageCheck size={28} />
              <strong>Catalog update in progress</strong>
              <span>{settings.emptyCatalogNote}</span>
              <Link href="/shop">
                <Button>Open Shop</Button>
              </Link>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Why Buy Here</span>
            <h2>{settings.whyTitle}</h2>
            <p>{settings.whySubtitle}</p>
          </div>
          <div className={styles.featureGrid}>
            {settings.features.slice(0, 6).map((feat) => {
              const Icon = HOME_ICON_MAP[feat.icon];
              return (
                <div key={feat.title} className={styles.featureCard}>
                  <Icon size={22} />
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.splitSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>After Checkout</span>
            <h2>{settings.stepsTitle}</h2>
            <p>{settings.stepsSubtitle}</p>
          </div>
          <div className={styles.stepsList}>
            {settings.steps.map((step) => (
              <div key={step.num} className={styles.stepRow}>
                <span>{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Account Delivery</span>
            <h2>Everything stays in your profile</h2>
            <p>
              Customers can log in after purchase to find their orders, keys,
              downloads, and product setup guides without digging through chat.
            </p>
          </div>
          <div className={styles.deliveryGrid}>
            <div className={styles.deliveryItem}>
              <Download size={22} />
              <h3>Downloads</h3>
              <p>Product files and access links are attached to delivered orders.</p>
            </div>
            <div className={styles.deliveryItem}>
              <PackageCheck size={22} />
              <h3>Keys</h3>
              <p>Digital keys are shown after successful payment and remain tied to the order.</p>
            </div>
            <div className={styles.deliveryItem}>
              <Gamepad2 size={22} />
              <h3>Setup Guides</h3>
              <p>Purchased products can include video guides, steps, and fixes.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Protection</span>
            <h2>{settings.protectionTitle}</h2>
            <p>{settings.protectionSubtitle}</p>
          </div>
          <div className={styles.trustGrid}>
            {settings.trustCards.map((card) => {
              const Icon = HOME_ICON_MAP[card.icon];
              return (
                <div key={card.title} className={styles.trustCard}>
                  <Icon size={24} />
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div>
            <span className={styles.eyebrow}>Ready</span>
            <h2>{settings.ctaTitle}</h2>
            <p>
              {primaryProduct
                ? `Start with ${primaryProduct.title}, or browse the full catalog for more access options.`
                : settings.ctaDescription}
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/shop">
              <Button size="lg">
                <ShoppingCart size={18} />
                Browse Shop
              </Button>
            </Link>
            <Link href="/support" className={styles.secondaryAction}>
              Contact Support <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
