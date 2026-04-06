import styles from "./StatusChip.module.css";

type StatusVariant =
  | "pending"
  | "paid"
  | "delivered"
  | "review"
  | "cancelled"
  | "refunded"
  | "chargeback";

interface StatusChipProps {
  status: StatusVariant;
  label?: string;
}

const LABELS: Record<StatusVariant, string> = {
  pending: "Pending",
  paid: "Paid",
  delivered: "Delivered",
  review: "Under Review",
  cancelled: "Cancelled",
  refunded: "Refunded",
  chargeback: "Chargeback",
};

export function StatusChip({ status, label }: StatusChipProps) {
  return (
    <span className={`${styles.chip} ${styles[status] || ""}`}>
      {label || LABELS[status]}
    </span>
  );
}
