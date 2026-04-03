import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { ContentGrid } from "@/components/layout/ContentGrid";
import { ProductCard } from "@/components/data/ProductCard";
import { Button } from "@/components/ui/Button";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { MOCK_PRODUCTS, MOCK_REVIEWS } from "@/lib/mockData";
import { Star, Package, User, ShieldCheck, Clock } from "lucide-react";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
  const related = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <div className={styles.layout}>
          {/* Left column */}
          <div>
            <div className={styles.gallery}>
              <Package size={48} strokeWidth={1.5} />
            </div>

            <div className={styles.descSection}>
              <h2 className={styles.descTitle}>Description</h2>
              <p className={styles.descText}>{product.description}</p>
            </div>

            {product.compatibility && (
              <div className={styles.compatSection}>
                <h3 className={styles.descTitle}>Compatibility</h3>
                <div className={styles.compatList}>
                  {product.compatibility.map((c) => (
                    <span key={c} className={styles.compatTag}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className={styles.reviewsSection}>
              <h2 className={styles.descTitle}>
                Reviews ({MOCK_REVIEWS.length})
              </h2>
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>
                        <User size={16} />
                      </div>
                      <span className={styles.reviewerName}>
                        {review.reviewer.username}
                      </span>
                    </div>
                    <div className={styles.reviewRating}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={
                            i < review.rating
                              ? "var(--warning)"
                              : "transparent"
                          }
                          color={
                            i < review.rating
                              ? "var(--warning)"
                              : "var(--text-muted)"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{review.text}</p>
                  <span className={styles.reviewDate}>{review.createdAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — purchase card */}
          <div className={styles.purchaseCard}>
            <h1 className={styles.itemName}>{product.title}</h1>
            <span className={styles.itemPrice}>
              ${product.price.toFixed(2)}
            </span>

            <div className={styles.sellerCluster}>
              <div className={styles.sellerAvatar}>
                <User size={18} />
              </div>
              <div className={styles.sellerInfo}>
                <span className={styles.sellerName}>
                  {product.seller.username}
                </span>
                <div className={styles.sellerMeta}>
                  <Star
                    size={12}
                    fill="var(--warning)"
                    color="var(--warning)"
                  />
                  {product.seller.rating} ({product.seller.reviewCount})
                  <VerificationBadge
                    tier={product.seller.verificationTier}
                    showLabel={false}
                  />
                </div>
              </div>
            </div>

            <div className={styles.ctaGroup}>
              <Button size="lg" style={{ width: "100%" }}>
                Buy Now
              </Button>
              <Button variant="secondary" size="lg" style={{ width: "100%" }}>
                Add to Cart
              </Button>
            </div>

            <div className={styles.deliveryNote}>
              <Clock
                size={14}
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              {product.deliveryEstimate}
            </div>

            <div className={styles.securityNote}>
              <ShieldCheck
                size={12}
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              Secure checkout · Money-back guarantee
            </div>
          </div>
        </div>

        {/* Related items */}
        <div className={styles.relatedSection}>
          <h2 className={styles.descTitle}>You might also like</h2>
          <ContentGrid columns={4}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ContentGrid>
        </div>
      </main>
      <Footer />
    </div>
  );
}
