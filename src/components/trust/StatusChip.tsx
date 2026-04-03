import type { StatusVariant } from "@/types";
import styles from "./StatusChip.module.css";

interface StatusChipProps {
  status: StatusVariant;
  label?: string;
}

const LABELS: Record<StatusVariant, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
  suspended: "Suspended",
};

export function StatusChip({ status, label }: StatusChipProps) {
  return (
    <span className={`${styles.chip} ${styles[status]}`}>
      {label || LABELS[status]}
    </span>
  );
}
