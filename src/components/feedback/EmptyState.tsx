import { PackageOpen } from "lucide-react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  message,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        {icon || <PackageOpen size={48} strokeWidth={1.5} />}
      </div>
      <p className={styles.message}>{message}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
