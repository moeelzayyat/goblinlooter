"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Clock3,
  Copy,
  Download,
  Eye,
  EyeOff,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import styles from "./page.module.css";

interface SuccessOrder {
  id: string;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
  items: {
    id: string;
    productTitle: string;
    downloadUrl: string | null;
  }[];
  key: {
    keyValue?: string;
  } | null;
}

interface CheckoutSuccessClientProps {
  orderId: string | null;
}

const POLLABLE_STATUSES = new Set(["pending", "paid"]);

export function CheckoutSuccessClient({
  orderId,
}: CheckoutSuccessClientProps) {
  const [order, setOrder] = useState<SuccessOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState<string | null>(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function loadOrder() {
      attempts += 1;

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Please log in to view your order delivery."
              : "We could not load your order yet."
          );
        }

        const data = await response.json();
        if (cancelled) return;

        setOrder(data.order);
        setError(null);

        if (POLLABLE_STATUSES.has(data.order.status) && attempts < 40) {
          timeout = setTimeout(loadOrder, 3000);
        } else {
          setLoading(false);
        }
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "We could not load your order."
        );
        setLoading(false);
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [orderId]);

  const downloads = useMemo(
    () => order?.items.filter((item) => item.downloadUrl) || [],
    [order]
  );

  async function copyKey() {
    if (!order?.key?.keyValue) return;
    try {
      await navigator.clipboard.writeText(order.key.keyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = order.key.keyValue;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  if (!orderId) {
    return (
      <div className={styles.card}>
        <CheckCircle className={styles.heroIcon} />
        <h1 className={styles.title}>Payment Received</h1>
        <p className={styles.subtitle}>
          Your checkout completed successfully. Open your orders to view delivery.
        </p>
        <div className={styles.actions}>
          <Link href="/orders">
            <Button>
              <ShoppingBag size={16} />
              My Orders
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary">
              <ArrowRight size={16} />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <RefreshCw className={`${styles.heroIcon} ${styles.spinning}`} />
        <h1 className={styles.title}>Finalizing Your Delivery</h1>
        <p className={styles.subtitle}>
          Payment was received. We&apos;re waiting for the blockchain confirmation
          and delivery webhook to finish assigning your key.
        </p>
        <div className={styles.statusPill}>
          <Clock3 size={14} />
          Checking order {orderId}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.card}>
        <Package className={styles.heroIcon} />
        <h1 className={styles.title}>Order Found, Delivery Not Ready</h1>
        <p className={styles.subtitle}>
          {error || "We could not confirm delivery yet."}
        </p>
        <div className={styles.actions}>
          <Link href="/orders">
            <Button>
              <ShoppingBag size={16} />
              My Orders
            </Button>
          </Link>
          <Link href="/support">
            <Button variant="secondary">Contact Support</Button>
          </Link>
        </div>
      </div>
    );
  }

  const delivered = order.status === "delivered";

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <CheckCircle className={styles.heroIcon} />
        <h1 className={styles.title}>
          {delivered ? "Payment Confirmed and Delivered" : "Payment Received"}
        </h1>
        <p className={styles.subtitle}>
          {delivered
            ? "Your order is ready below. You can reveal the key, copy it, and download the product right away."
            : "Your payment cleared, but delivery is still finishing in the background. You can safely keep this page open or check your order details."}
        </p>
        <div className={styles.statusRow}>
          <div className={styles.statusPill}>
            <ShieldCheck size={14} />
            Order {order.id}
          </div>
          <div className={styles.statusPill}>
            <Clock3 size={14} />
            {delivered && order.deliveredAt
              ? `Delivered ${new Date(order.deliveredAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Awaiting final delivery"}
          </div>
        </div>
      </div>

      {order.key?.keyValue && delivered && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Your License Key</h2>
            <span>Reveal it only when you&apos;re ready to activate.</span>
          </div>
          <div className={styles.keyBox}>
            <div className={styles.keyValue}>
              {keyVisible ? order.key.keyValue : "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"}
            </div>
            <div className={styles.keyActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setKeyVisible((value) => !value)}
              >
                {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                {keyVisible ? "Hide" : "Reveal"}
              </button>
              {keyVisible && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={copyKey}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {downloads.length > 0 && delivered && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Downloads</h2>
            <span>Your download links are ready immediately after payment.</span>
          </div>
          <div className={styles.downloadList}>
            {downloads.map((item) => (
              <div key={item.id} className={styles.downloadCard}>
                <div>
                  <div className={styles.downloadTitle}>{item.productTitle}</div>
                  <div className={styles.downloadMeta}>
                    Secure delivery for this order
                  </div>
                </div>
                <a
                  href={item.downloadUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.downloadButton}
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={styles.actions}>
        <Link href={`/orders/${order.id}`}>
          <Button>
            <ShoppingBag size={16} />
            View Full Order
          </Button>
        </Link>
        <Link href="/support">
          <Button variant="secondary">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
}
