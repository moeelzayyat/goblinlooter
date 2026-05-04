"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/data/ProductCard";
import { ContentGrid } from "@/components/layout/ContentGrid";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/types";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Download,
  Gamepad2,
  Headphones,
  Package,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from "lucide-react";
import styles from "./page.module.css";

type CheckoutProvider = "btcpay";

const DEFAULT_DISCLAIMER =
  "Use this product only on systems and accounts where you understand and accept the applicable game, platform, and service terms. Confirm compatibility before purchase.";

type ProductVideoEmbed = {
  type: "iframe" | "video";
  src: string;
};

interface ProductClientPageProps {
  product: Product;
  related: Product[];
}

function formatCategoryLabel(category: string) {
  return category === "configs" ? "Configuration" : "Digital Service";
}

function formatDeliveryMethod(method: Product["deliveryMethod"]) {
  return method.replace("-", " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

function getAvailabilityLabel(product: Product) {
  return product.availabilityLabel?.trim() || "Available";
}

function getAvailabilityToneClass(product: Product) {
  switch (product.availabilityTone) {
    case "orange":
      return styles.stockBadgeOrange;
    case "red":
      return styles.stockBadgeRed;
    case "blue":
      return styles.stockBadgeBlue;
    case "gray":
      return styles.stockBadgeGray;
    case "green":
    default:
      return styles.stockBadgeGreen;
  }
}

function splitDescription(value: string) {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : [value];
}

function resolveProductVideoEmbed(videoUrl: string | null | undefined): ProductVideoEmbed | null {
  if (!videoUrl?.trim()) return null;

  try {
    const url = new URL(videoUrl.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname;

    if (host === "youtu.be") {
      const id = path.split("/").filter(Boolean)[0];
      return id ? { type: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v");
      if (watchId) {
        return {
          type: "iframe",
          src: `https://www.youtube.com/embed/${watchId}`,
        };
      }

      if (path.startsWith("/embed/")) {
        return { type: "iframe", src: url.toString() };
      }
    }

    if (host === "vimeo.com") {
      const id = path.split("/").filter(Boolean)[0];
      return id ? { type: "iframe", src: `https://player.vimeo.com/video/${id}` } : null;
    }

    if (host === "player.vimeo.com" && path.startsWith("/video/")) {
      return { type: "iframe", src: url.toString() };
    }

    if (/\.(mp4|webm|ogg)$/i.test(path)) {
      return { type: "video", src: url.toString() };
    }
  } catch {
    return null;
  }

  return null;
}

export function ProductClientPage({ product, related }: ProductClientPageProps) {
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState<CheckoutProvider | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const purchaseOptions = product.purchaseOptions || [];
  const [selectedOptionId, setSelectedOptionId] = useState(
    purchaseOptions[0]?.id || ""
  );

  useEffect(() => {
    trackEvent("product_view", {
      productId: product.id,
      category: product.category,
    });
  }, [product.category, product.id]);

  useEffect(() => {
    setSelectedOptionId(product.purchaseOptions?.[0]?.id || "");
    setMainImageIndex(0);
  }, [product.id, product.purchaseOptions]);

  const selectedOption =
    purchaseOptions.find((option) => option.id === selectedOptionId) ||
    purchaseOptions[0] ||
    null;
  const displayPrice = selectedOption?.price ?? product.price;
  const categoryLabel = formatCategoryLabel(product.category);
  const images = product.images.filter(Boolean);
  const mainImage = images[mainImageIndex] || images[0] || "";
  const descriptionParagraphs = splitDescription(product.fullDescription);
  const videoEmbed =
    resolveProductVideoEmbed(product.videoUrl) ||
    (product.productVideo
      ? { type: "video" as const, src: product.productVideo.videoUrl }
      : null);
  const featureGroups = product.featureGroups || [];
  const productDisclaimer = product.disclaimer || DEFAULT_DISCLAIMER;
  const availabilityLabel = getAvailabilityLabel(product);
  const availabilityToneClass = getAvailabilityToneClass(product);

  async function handleBuyNow() {
    if (checkingOut) return;
    setCheckoutError(null);
    setCheckingOut("btcpay");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          paymentProvider: "btcpay",
          purchaseOptionId: selectedOption?.id || null,
        }),
      });
      const data = await response.json();

      if (response.status === 401 && data.loginUrl) {
        router.push(data.loginUrl);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setCheckoutError(
        data.error || "Failed to create checkout session. Please try again."
      );
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(null);
    }
  }

  const productDetails = [
    ["Category", categoryLabel],
    ["Platform", product.platform.join(", ")],
    ["Compatibility", product.compatibilityNotes],
    ["Delivery Method", formatDeliveryMethod(product.deliveryMethod)],
    ["Delivery Time", product.deliveryTimeEstimate],
  ];

  if (product.regionRestrictions) {
    productDetails.push(["Region", product.regionRestrictions]);
  }

  const showcaseItems = [
    {
      icon: Gamepad2,
      title: "Player-focused setup",
      copy: "Configured for a smooth PC workflow with clear setup guidance.",
    },
    {
      icon: ShieldCheck,
      title: "Secure checkout",
      copy: "Checkout and delivery stay connected to your order.",
    },
    {
      icon: Download,
      title: "Fast delivery",
      copy: product.deliveryTimeEstimate,
    },
    {
      icon: Headphones,
      title: "Support access",
      copy: "Support is available if you need help after purchase.",
    },
  ];

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <nav className={styles.breadcrumb}>
          <Link href="/shop" className={styles.breadcrumbLink}>
            Store
          </Link>
          <ChevronRight size={14} />
          <Link
            href={`/shop?category=${product.category}`}
            className={styles.breadcrumbLink}
          >
            {categoryLabel}
          </Link>
          <ChevronRight size={14} />
          <span className={styles.breadcrumbCurrent}>{product.title}</span>
        </nav>

        <section className={styles.storeHero}>
          <div className={styles.storeHeroCopy}>
            <span className={styles.heroEyebrow}>GoblinLooter Store</span>
            <h1>Digital Setup Resources. Fast Access.</h1>
            <p>
              Stable digital access, clear delivery, secure checkout, and real
              support from purchase through activation.
            </p>
            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.heroLink}>
                Browse products
              </Link>
              <Link href="/support" className={styles.heroLinkSecondary}>
                Contact support
              </Link>
            </div>
          </div>
          <div className={styles.heroMetrics} aria-label="Store highlights">
            <div>
              <strong>{product.deliveryTimeEstimate}</strong>
              <span>Delivery</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Order access</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>Checkout</span>
            </div>
          </div>
        </section>

        <section className={styles.productLayout}>
          <div className={styles.galleryPanel}>
            <div className={styles.mainImage}>
              {mainImage ? (
                <img src={mainImage} alt={product.title} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <Package size={64} strokeWidth={1} />
                </div>
              )}
            </div>

            {images.length > 1 ? (
              <div className={styles.thumbnailRail} aria-label="Product images">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`${styles.thumbnailButton} ${
                      index === mainImageIndex ? styles.thumbnailButtonActive : ""
                    }`}
                    onClick={() => setMainImageIndex(index)}
                    aria-label={`Show product image ${index + 1}`}
                  >
                    <span
                      className={styles.thumbnailPreview}
                      style={{ backgroundImage: `url("${image}")` }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <aside className={styles.purchasePanel}>
            <div className={styles.productHeader}>
              <div className={styles.headerBadges}>
                <span className={styles.categoryBadge}>{categoryLabel}</span>
                <span
                  className={`${styles.stockBadge} ${availabilityToneClass}`}
                >
                  {availabilityLabel}
                </span>
              </div>
              <h2>{product.title}</h2>
              <p>{product.shortDescription}</p>
            </div>

            <div className={styles.priceSummary}>
              <span>Starting at</span>
              <strong>${displayPrice.toFixed(2)}</strong>
              {selectedOption ? <em>{selectedOption.label}</em> : null}
            </div>

            <div className={styles.optionSection}>
              <div className={styles.sectionLabel}>
                {purchaseOptions.length > 0 ? "Select Price Per Key" : "Price"}
              </div>

              {purchaseOptions.length > 0 ? (
                <div className={styles.optionList}>
                  {purchaseOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.optionCard} ${
                        selectedOption?.id === option.id
                          ? styles.optionCardActive
                          : ""
                      }`}
                      onClick={() => setSelectedOptionId(option.id)}
                      aria-pressed={selectedOption?.id === option.id}
                    >
                      <span>
                        <strong>{option.label}</strong>
                        {option.description ? (
                          <small>{option.description}</small>
                        ) : null}
                      </span>
                      <b>${option.price.toFixed(2)}</b>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`${styles.optionCard} ${styles.optionCardActive}`}>
                  <span>
                    <strong>Standard access</strong>
                    <small>{product.deliveryTimeEstimate}</small>
                  </span>
                  <b>${product.price.toFixed(2)}</b>
                </div>
              )}
            </div>

            <div className={styles.deliveryInfo}>
              <Zap size={16} />
              <span>
                {product.deliveryMethod === "key" && "Digital key - "}
                {product.deliveryMethod === "download" && "Digital download - "}
                {product.deliveryMethod === "manual" && "Manual delivery - "}
                {product.deliveryTimeEstimate}
              </span>
            </div>

            <div className={styles.actions}>
              <Button
                size="lg"
                className={styles.checkoutButton}
                onClick={handleBuyNow}
                disabled={Boolean(checkingOut)}
              >
                <ShoppingCart size={18} />
                {checkingOut === "btcpay" ? "Processing..." : "Pay with Crypto"}
              </Button>
            </div>

            {checkoutError ? (
              <div className={styles.checkoutError} role="alert">
                <p>{checkoutError}</p>
                <Link href="/support" className={styles.checkoutErrorLink}>
                  Contact support if the issue keeps happening
                </Link>
              </div>
            ) : null}

            <div className={styles.guarantee}>
              <ShieldCheck size={16} />
              <span>Secure checkout - Buyer protection - Real support</span>
            </div>
          </aside>
        </section>

        <section className={styles.contentLayout}>
          <article className={styles.articleStack}>
            <section className={styles.contentPanel}>
              <div className={styles.contentHeader}>
                <span>Product Overview</span>
                <h2>{product.title}</h2>
              </div>
              <div className={styles.descriptionCopy}>
                {descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {videoEmbed ? (
              <section className={styles.contentPanel}>
                <div className={styles.contentHeader}>
                  <span>Product Video</span>
                  <h2>Preview and setup</h2>
                </div>
                <div className={styles.videoLabel}>
                  <PlayCircle size={18} />
                  <span>Product media</span>
                </div>
                <div className={styles.videoFrame}>
                  {videoEmbed.type === "iframe" ? (
                    <iframe
                      src={videoEmbed.src}
                      title={`${product.title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video src={videoEmbed.src} controls preload="metadata" />
                  )}
                </div>
              </section>
            ) : null}

            {featureGroups.length > 0 ? (
              <section className={styles.contentPanel}>
                <div className={styles.contentHeader}>
                  <span>Product Features</span>
                  <h2>Included capabilities</h2>
                </div>
                <div className={styles.featureGrid}>
                  {featureGroups.map((group) => (
                    <div key={group.id} className={styles.featureCard}>
                      <div className={styles.featureCardHeader}>
                        <h3>{group.title}</h3>
                        {group.description ? <p>{group.description}</p> : null}
                      </div>
                      <ul className={styles.featureBulletList}>
                        {group.items.map((item) => (
                          <li key={item}>
                            <span />
                            <p>{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className={styles.contentPanel}>
                <div className={styles.contentHeader}>
                  <span>Product Showcase</span>
                  <h2>What is included</h2>
                </div>
                <div className={styles.showcaseGrid}>
                  {showcaseItems.map(({ icon: Icon, title, copy }) => (
                    <div key={title} className={styles.showcaseItem}>
                      <Icon size={20} />
                      <div>
                        <h3>{title}</h3>
                        <p>{copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className={styles.contentPanel}>
              <div className={styles.contentHeader}>
                <span>Requirements</span>
                <h2>Before you buy</h2>
              </div>
              <div className={styles.requirementGrid}>
                {productDetails.map(([label, value]) => (
                  <div key={label} className={styles.requirementItem}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.noticePanel}>
              <AlertTriangle size={20} />
              <div>
                <h2>Important notice</h2>
                <p>
                  Make sure your system matches the requirements above before
                  purchase. If you are unsure, contact support first so the team
                  can confirm compatibility.
                </p>
              </div>
            </section>

            <section className={styles.disclaimerPanel}>
              <AlertTriangle size={20} />
              <div>
                <span>Disclaimer</span>
                <h2>Use responsibly</h2>
                <p>{productDisclaimer}</p>
              </div>
            </section>
          </article>

          <aside className={styles.sideStack}>
            <section className={styles.sidePanel}>
              <h2>Access summary</h2>
              <ul className={styles.checkList}>
                <li>
                  <Check size={16} />
                  <span>{formatDeliveryMethod(product.deliveryMethod)}</span>
                </li>
                <li>
                  <Check size={16} />
                  <span>{product.deliveryTimeEstimate}</span>
                </li>
                <li>
                  <Check size={16} />
                  <span>{product.platform.join(", ")}</span>
                </li>
              </ul>
            </section>

            <section className={styles.sidePanel}>
              <h2>Refund info</h2>
              <div className={styles.refundBadge}>
                {product.refundEligibility.replace("-", " ")}
              </div>
              <p>{product.refundTerms}</p>
              <Link href="/refund-policy" className={styles.inlineLink}>
                Read refund policy
              </Link>
            </section>

            <section className={styles.sidePanel}>
              <h2>Need help?</h2>
              <p>
                Questions before purchase or after activation can be sent to the
                support team.
              </p>
              <Link href="/support" className={styles.supportLink}>
                Contact support
              </Link>
            </section>
          </aside>
        </section>

        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related products</h2>
            <ContentGrid columns={4}>
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </ContentGrid>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
