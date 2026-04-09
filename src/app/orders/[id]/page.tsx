"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import styles from "./page.module.css";

interface OrderDetail {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  btcpayInvoiceId: string | null;
  deliveredAt: string | null;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    productTitle: string;
    productSlug: string | null;
    deliveryMethod: string | null;
    downloadUrl: string | null;
    quantity: number;
    unitPrice: number;
  }[];
  key: {
    id: string;
    status: string;
    keyValue?: string;
  } | null;
}

const STATUS_MAP: Record<
  string,
  { icon: React.ReactNode; title: string; description: string; color: string }
> = {
  pending: {
    icon: <Clock size={24} />,
    title: "Payment Pending",
    description: "Waiting for payment confirmation on the blockchain.",
    color: "var(--info)",
  },
  paid: {
    icon: <CheckCircle size={24} />,
    title: "Payment Confirmed",
    description: "Your payment has been confirmed. Your key is being prepared.",
    color: "var(--accent)",
  },
  delivered: {
    icon: <Package size={24} />,
    title: "Delivered",
    description: "Your product key is ready! See below.",
    color: "var(--accent)",
  },
  review: {
    icon: <AlertCircle size={24} />,
    title: "Under Review",
    description:
      "Your order is being reviewed. You'll receive your key shortly.",
    color: "var(--warning)",
  },
  cancelled: {
    icon: <XCircle size={24} />,
    title: "Cancelled",
    description: "This order was cancelled.",
    color: "var(--danger)",
  },
  refunded: {
    icon: <XCircle size={24} />,
    title: "Refunded",
    description: "This order has been refunded.",
    color: "var(--danger)",
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch {
        console.error("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleCopyKey = async () => {
    if (!order?.key?.keyValue) return;
    try {
      await navigator.clipboard.writeText(order.key.keyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = order.key.keyValue;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloads =
    order?.status === "delivered"
      ? order.items.filter((item) => item.downloadUrl)
      : [];

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/orders" className={styles.breadcrumbLink}>
            My Orders
          </Link>
          <ChevronRight size={14} />
          <span className={styles.breadcrumbCurrent}>
            {orderId}
          </span>
        </nav>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : !order ? (
          <div className={styles.notFound}>
            <AlertCircle size={48} strokeWidth={1} />
            <h2>Order not found</h2>
            <p>This order doesn&apos;t exist or you don&apos;t have access.</p>
            <Link href="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Status banner */}
            {(() => {
              const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <div
                  className={`${styles.statusBanner} ${styles[order.status]}`}
                >
                  <div className={styles.statusIcon} style={{ color: s.color }}>
                    {s.icon}
                  </div>
                  <div className={styles.statusInfo}>
                    <h2>{s.title}</h2>
                    <p>{s.description}</p>
                  </div>
                </div>
              );
            })()}

            {/* Product Key (if delivered) */}
            {order.key && order.status === "delivered" && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Your Product Key</h3>
                <div className={styles.keyBox}>
                  {keyVisible && order.key.keyValue ? (
                    <span className={styles.keyValue}>
                      {order.key.keyValue}
                    </span>
                  ) : (
                    <span className={styles.keyHidden}>
                      ••••••••-••••-••••-••••-••••••••••••
                    </span>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className={styles.copyBtn}
                      onClick={() => setKeyVisible(!keyVisible)}
                    >
                      {keyVisible ? (
                        <>
                          <EyeOff size={12} /> Hide
                        </>
                      ) : (
                        <>
                          <Eye size={12} /> Reveal
                        </>
                      )}
                    </button>
                    {keyVisible && order.key.keyValue && (
                      <button
                        className={styles.copyBtn}
                        onClick={handleCopyKey}
                      >
                        {copied ? (
                          <>
                            <Check size={12} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {downloads.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Downloads</h3>
                <div className={styles.downloadList}>
                  {downloads.map((item) => (
                    <div key={item.id} className={styles.downloadCard}>
                      <div>
                        <div className={styles.downloadTitle}>{item.productTitle}</div>
                        <div className={styles.downloadMeta}>
                          Instant access after payment confirmation
                        </div>
                      </div>
                      <a
                        href={item.downloadUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.downloadButton}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order details */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Order Details</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Order ID</span>
                <span className={`${styles.detailValue} ${styles.mono}`}>
                  {order.id}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {order.paymentMethod && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment Method</span>
                  <span className={`${styles.detailValue} ${styles.accent}`}>
                    {order.paymentMethod}
                  </span>
                </div>
              )}
              {order.deliveredAt && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Delivered</span>
                  <span className={styles.detailValue}>
                    {new Date(order.deliveredAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Items</h3>
              {order.items.map((item) => (
                <div key={item.id} className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    {item.productTitle} × {item.quantity}
                  </span>
                  <span className={`${styles.detailValue} ${styles.warning}`}>
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div
                className={styles.detailRow}
                style={{ borderTop: "1px solid var(--border-default)" }}
              >
                <span
                  className={styles.detailLabel}
                  style={{ fontWeight: 600, color: "var(--text-primary)" }}
                >
                  Total
                </span>
                <span className={`${styles.detailValue} ${styles.warning}`}
                  style={{ fontSize: "var(--text-lg)" }}
                >
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Link href="/support">
                <Button variant="secondary">Contact Support</Button>
              </Link>
              <Link href="/shop">
                <Button variant="ghost">Continue Shopping</Button>
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
