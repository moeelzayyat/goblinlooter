import { Shield, ShieldCheck } from "lucide-react";
import styles from "./VerificationBadge.module.css";

type BadgeTier = "customer" | "admin";

interface VerificationBadgeProps {
  tier: BadgeTier;
  showLabel?: boolean;
}

const CONFIG: Record<BadgeTier, { icon: typeof Shield; label: string }> = {
  customer: { icon: Shield, label: "Customer" },
  admin: { icon: ShieldCheck, label: "Admin" },
};

export function VerificationBadge({
  tier,
  showLabel = true,
}: VerificationBadgeProps) {
  const { icon: Icon, label } = CONFIG[tier];

  return (
    <span className={`${styles.badge} ${styles[tier] || ""}`} title={label}>
      <Icon size={14} />
      {showLabel && label}
    </span>
  );
}
