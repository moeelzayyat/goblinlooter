import styles from "./SkeletonLoader.module.css";

type SkeletonVariant = "card" | "text-line" | "stat-card" | "table-row";

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
}

function SkeletonItem({ variant }: { variant: SkeletonVariant }) {
  switch (variant) {
    case "card":
      return (
        <div className={`${styles.skeleton} ${styles.card}`}>
          <div className={`${styles.skeleton} ${styles.cardImage}`} />
          <div className={`${styles.skeleton} ${styles.cardTitle}`} />
          <div className={`${styles.skeleton} ${styles.cardDesc}`} />
          <div className={styles.cardMeta}>
            <div className={`${styles.skeleton} ${styles.cardMetaItem}`} />
            <div className={`${styles.skeleton} ${styles.cardMetaItem}`} />
          </div>
        </div>
      );
    case "stat-card":
      return <div className={`${styles.skeleton} ${styles.statCard}`} />;
    case "table-row":
      return <div className={`${styles.skeleton} ${styles.tableRow}`} />;
    case "text-line":
    default:
      return <div className={`${styles.skeleton} ${styles.textLine}`} />;
  }
}

export function SkeletonLoader({
  variant = "card",
  count = 1,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonItem key={i} variant={variant} />
      ))}
    </>
  );
}
