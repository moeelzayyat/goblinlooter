"use client";

import { Modal } from "./Modal";
import { Button } from "@/components/ui/Button";
import type { ButtonVariant } from "@/types";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  warning?: string;
  confirmLabel?: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  warning,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ color: "var(--text-secondary)", marginBottom: warning ? "var(--space-md)" : 0 }}>
        {description}
      </p>
      {warning && (
        <p
          style={{
            color: "var(--danger)",
            fontSize: "var(--text-sm)",
            padding: "var(--space-md)",
            background: "var(--danger-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {warning}
        </p>
      )}
    </Modal>
  );
}
