import styles from "./ContentGrid.module.css";

interface ContentGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export function ContentGrid({
  columns = 3,
  children,
  className,
}: ContentGridProps) {
  return (
    <div
      className={`${styles.grid} ${styles[`cols${columns}`]} ${className || ""}`}
    >
      {children}
    </div>
  );
}
