import type { LucideIcon } from "lucide-react";
import styles from "./StatCard.module.css";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

export function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconRow}>
        <Icon size={20} className={styles.icon} />
      </div>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
