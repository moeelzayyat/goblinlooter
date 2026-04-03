import { Shield, ShieldCheck, ShieldPlus } from "lucide-react";
import type { VerificationTier } from "@/types";
import styles from "./VerificationBadge.module.css";

interface VerificationBadgeProps {
  tier: VerificationTier;
  showLabel?: boolean;
}

const CONFIG: Record<
  VerificationTier,
  { icon: typeof Shield; label: string }
> = {
  unverified: { icon: Shield, label: "Unverified" },
  verified: { icon: ShieldCheck, label: "Verified" },
  trusted: { icon: ShieldPlus, label: "Trusted Seller" },
};

export function VerificationBadge({
  tier,
  showLabel = true,
}: VerificationBadgeProps) {
  const { icon: Icon, label } = CONFIG[tier];

  return (
    <span className={`${styles.badge} ${styles[tier]}`} title={label}>
      <Icon size={14} />
      {showLabel && label}
    </span>
  );
}
