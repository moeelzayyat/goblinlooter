import Link from "next/link";
import { Star, Package } from "lucide-react";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Product } from "@/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/item/${product.id}`} className={styles.card}>
      {product.thumbnailUrl ? (
        <img
          src={product.thumbnailUrl}
          alt={product.title}
          className={styles.thumbnail}
        />
      ) : (
        <div className={styles.thumbnailPlaceholder}>
          <Package size={32} strokeWidth={1.5} />
        </div>
      )}

      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.description}>{product.description}</p>

        <div className={styles.meta}>
          <div className={styles.rating}>
            <Star size={14} fill="var(--warning)" color="var(--warning)" />
            <span className={styles.ratingValue}>
              {product.rating.toFixed(1)}
            </span>
            <span className={styles.reviewCount}>({product.reviewCount})</span>
          </div>
          <span className={styles.price}>
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <VerificationBadge
          tier={product.seller.verificationTier}
          showLabel={false}
        />
        <span className={styles.cta}>View →</span>
      </div>
    </Link>
  );
}
