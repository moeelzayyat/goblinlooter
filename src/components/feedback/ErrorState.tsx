import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./EmptyState.module.css";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <AlertTriangle size={48} strokeWidth={1.5} />
      </div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
