"use client";

import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  onDismiss: () => void;
}

export function FilterChip({ label, onDismiss }: FilterChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-xs)",
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        color: "var(--text-primary)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        padding: "4px 8px",
      }}
    >
      {label}
      <button
        onClick={onDismiss}
        aria-label={`Remove ${label} filter`}
        style={{
          display: "flex",
          color: "var(--text-muted)",
          cursor: "pointer",
        }}
      >
        <X size={12} />
      </button>
    </span>
  );
}
