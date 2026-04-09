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
  Package,
  Zap,
  ChevronRight,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import styles from "./page.module.css";

type TabId = "description" | "details" | "refund";

interface ProductClientPageProps {
  product: Product;
  related: Product[];
}

function formatCategoryLabel(category: string) {
  return category.replace("-", " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

export function ProductClientPage({
  product,
  related,
}: ProductClientPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("product_view", {
      productId: product.id,
      category: product.category,
    });
  }, [product.category, product.id]);

  async function handleBuyNow() {
    if (checkingOut) return;
    setCheckoutError(null);
    setCheckingOut(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug }),
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
      setCheckingOut(false);
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    { id: "refund", label: "Refund Info" },
  ];
  const categoryLabel = formatCategoryLabel(product.category);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <nav className={styles.breadcrumb}>
          <Link href="/shop" className={styles.breadcrumbLink}>
            Shop
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

        <div className={styles.productHero}>
          <div className={styles.productImage}>
            {product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.title} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <Package size={64} strokeWidth={1} />
              </div>
            )}
          </div>

          <div className={styles.productInfo}>
            <span className={styles.categoryBadge}>{categoryLabel}</span>
            <h1 className={styles.productTitle}>{product.title}</h1>
            <p className={styles.productShort}>{product.shortDescription}</p>

            <div className={styles.priceBlock}>
              <span className={styles.price}>${product.price.toFixed(2)}</span>
              {product.stockCount !== undefined && product.stockCount < 10 && (
                <span className={styles.lowStock}>Only {product.stockCount} left</span>
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

            <div className={styles.platformTags}>
              {product.platform.map((platform) => (
                <span key={platform} className={styles.platformTag}>
                  {platform}
                </span>
              ))}
              {product.regionRestrictions && (
                <span className={styles.regionTag}>{product.regionRestrictions}</span>
              )}
            </div>

            <div className={styles.actions}>
              <Button
                size="lg"
                style={{ flex: 1 }}
                onClick={handleBuyNow}
                disabled={checkingOut}
              >
                <ShoppingCart size={18} />
                {checkingOut ? "Processing..." : "Buy Now - Pay with Crypto"}
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
          </div>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === "description" && (
            <div className={styles.descriptionTab}>
              <p>{product.fullDescription}</p>
            </div>
          )}

          {activeTab === "details" && (
            <div className={styles.detailsTab}>
              <table className={styles.detailsTable}>
                <tbody>
                  <tr>
                    <td>Category</td>
                    <td>{categoryLabel}</td>
                  </tr>
                  <tr>
                    <td>Platform</td>
                    <td>{product.platform.join(", ")}</td>
                  </tr>
                  <tr>
                    <td>Compatibility</td>
                    <td>{product.compatibilityNotes}</td>
                  </tr>
                  <tr>
                    <td>Delivery Method</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {product.deliveryMethod}
                    </td>
                  </tr>
                  <tr>
                    <td>Delivery Time</td>
                    <td>{product.deliveryTimeEstimate}</td>
                  </tr>
                  {product.regionRestrictions && (
                    <tr>
                      <td>Region</td>
                      <td>{product.regionRestrictions}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "refund" && (
            <div className={styles.refundTab}>
              <div className={styles.refundBadge}>
                Refund Eligibility:{" "}
                <strong style={{ textTransform: "capitalize" }}>
                  {product.refundEligibility.replace("-", " ")}
                </strong>
              </div>
              <p className={styles.refundTerms}>{product.refundTerms}</p>
              <p className={styles.refundGeneral}>
                All refund requests are handled through our support team within
                72 hours of purchase. See our full{" "}
                <Link href="/refund-policy">Refund Policy</Link> for details.
              </p>
              <Link href="/support">
                <Button variant="ghost" size="sm">
                  Contact Support about this product
                </Button>
              </Link>
            </div>
          )}
        </div>

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
