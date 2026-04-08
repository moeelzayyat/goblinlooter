"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import styles from "./page.module.css";

interface OrderSummary {
  id: string;
  status: string;
  totalAmount: number;
  productTitle: string;
  paymentMethod: string | null;
  createdAt: string;
  deliveredAt: string | null;
}

const STATUS_CONFIG: Record<
  string,
  { icon: React.ReactNode; css: string; label: string }
> = {
  pending: {
    icon: <Clock size={12} />,
    css: styles.statusPending,
    label: "Pending",
  },
  paid: {
    icon: <CheckCircle size={12} />,
    css: styles.statusPaid,
    label: "Paid",
  },
  delivered: {
    icon: <Package size={12} />,
    css: styles.statusDelivered,
    label: "Delivered",
  },
  review: {
    icon: <AlertCircle size={12} />,
    css: styles.statusReview,
    label: "In Review",
  },
  cancelled: {
    icon: <XCircle size={12} />,
    css: styles.statusCancelled,
    label: "Cancelled",
  },
  refunded: {
    icon: <XCircle size={12} />,
    css: styles.statusRefunded,
    label: "Refunded",
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <PageHeader title="My Orders" />

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} strokeWidth={1} />
            <h2>No orders yet</h2>
            <p>
              When you make a purchase, your orders will appear here so you
              can track their status and access your product keys.
            </p>
            <Link href="/shop">
              <Button>Browse Shop</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] ||
                STATUS_CONFIG.pending;
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className={styles.orderCard}
                >
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className={styles.orderBody}>
                    <span className={styles.orderProduct}>
                      {order.productTitle}
                    </span>
                    <span className={styles.orderAmount}>
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.orderFooter}>
                    <span
                      className={`${styles.statusBadge} ${config.css}`}
                    >
                      {config.icon} {config.label}
                    </span>
                    <span className={styles.viewLink}>
                      View Details <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
