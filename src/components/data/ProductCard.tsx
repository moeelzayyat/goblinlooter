import Link from "next/link";
import { Package, Zap } from "lucide-react";
import type { Product } from "@/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.slug}`} className={styles.card}>
      {product.images.length > 0 ? (
        <img
          src={product.images[0]}
          alt={product.title}
          className={styles.thumbnail}
        />
      ) : (
        <div className={styles.thumbnailPlaceholder}>
          <Package size={32} strokeWidth={1.5} />
        </div>
      )}

      <div className={styles.body}>
        <span className={styles.category}>{product.category.replace("-", " ")}</span>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.description}>{product.shortDescription}</p>

        <div className={styles.meta}>
          <div className={styles.delivery}>
            <Zap size={12} />
            <span>{product.deliveryTimeEstimate}</span>
          </div>
          <span className={styles.price}>
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        {product.stockCount !== undefined && product.stockCount < 10 && (
          <span className={styles.lowStock}>Low stock</span>
        )}
        <span className={styles.cta}>View →</span>
      </div>
    </Link>
  );
}
