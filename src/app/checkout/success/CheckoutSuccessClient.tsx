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
  ExternalLink,
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
    thankYouMessage: string | null;
  }[];
  key: {
    keyValue?: string;
  } | null;
}

interface CheckoutSuccessClientProps {
  orderId: string | null;
}

const POLLABLE_STATUSES = new Set(["pending", "paid"]);
const URL_PATTERN = /https?:\/\/[^\s]+/g;

function getAccessLinkTitle(url: string, index: number) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (hostname.startsWith("arc.")) return "Main Download Portal";
    if (hostname.startsWith("web.")) return "Web Tool";
    if (hostname.startsWith("solo.")) return "Solo Tool";

    return hostname;
  } catch {
    return index === 0 ? "Access Link" : `Access Link ${index + 1}`;
  }
}

function parseAccessInstructions(message: string) {
  const links = [...message.matchAll(URL_PATTERN)].map((match, index) => {
    const url = match[0].replace(/[),.;]+$/, "");

    return {
      url,
      title: getAccessLinkTitle(url, index),
      host: (() => {
        try {
          return new URL(url).hostname.replace(/^www\./, "");
        } catch {
          return url;
        }
      })(),
    };
  });
  const cleanedMessage = message.replace(URL_PATTERN, " ").replace(/\s+/g, " ").trim();
  const firstHeadingIndex = cleanedMessage.search(
    /access your product|main download portal|web tool|solo tool|important notes/i
  );
  const importantNotesIndex = cleanedMessage.search(/important notes/i);
  const intro =
    firstHeadingIndex > -1
      ? cleanedMessage.slice(0, firstHeadingIndex).trim()
      : cleanedMessage;
  const note =
    importantNotesIndex > -1
      ? cleanedMessage
          .slice(importantNotesIndex)
          .replace(/^important notes/i, "")
          .trim()
      : "";

  return {
    intro,
    note,
    links,
  };
}

export function CheckoutSuccessClient({
  orderId,
}: CheckoutSuccessClientProps) {
  const [order, setOrder] = useState<SuccessOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
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
          if (response.status === 401) {
            setRequiresLogin(true);
            throw new Error("Please log in to view your order delivery.");
          }

          throw new Error(
            response.status === 404
              ? "We could not find this order for your account."
              : "We could not load your order yet."
          );
        }

        const data = await response.json();
        if (cancelled) return;

        setOrder(data.order);
        setError(null);
        setRequiresLogin(false);

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
          Payment was received. We&apos;re waiting for payment confirmation
          and the delivery webhook to finish assigning your key.
        </p>
        <div className={styles.statusPill}>
          <Clock3 size={14} />
          Checking order {orderId}
        </div>
      </div>
    );
  }

  if (error || !order) {
    const loginHref = `/auth/login?callbackUrl=${encodeURIComponent(
      `/checkout/success?orderId=${orderId}`
    )}`;

    return (
      <div className={styles.card}>
        <Package className={styles.heroIcon} />
        <h1 className={styles.title}>
          {requiresLogin ? "Log In to View Your Order" : "Order Not Ready"}
        </h1>
        <p className={styles.subtitle}>
          {error || "We could not confirm delivery yet."}
        </p>
        <div className={styles.actions}>
          {requiresLogin ? (
            <Link href={loginHref}>
              <Button>
                <ShoppingBag size={16} />
                Log In
              </Button>
            </Link>
          ) : (
            <Link href="/orders">
              <Button>
                <ShoppingBag size={16} />
                My Orders
              </Button>
            </Link>
          )}
          <Link href="/support">
            <Button variant="secondary">Contact Support</Button>
          </Link>
        </div>
      </div>
    );
  }

  const delivered = order.status === "delivered";
  const thankYouMessage =
    order.items.find((item) => item.thankYouMessage)?.thankYouMessage || null;
  const accessInstructions = thankYouMessage
    ? parseAccessInstructions(thankYouMessage)
    : null;

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <CheckCircle className={styles.heroIcon} />
        <h1 className={styles.title}>
          {delivered ? "Payment Confirmed and Delivered" : "Payment Received"}
        </h1>
        <p className={styles.subtitle}>
          {delivered
            ? "Your payment was successful. Your access details are ready below."
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

      {accessInstructions && delivered && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Access Instructions</h2>
            <span>Use these links and notes to get started.</span>
          </div>

          {accessInstructions.intro ? (
            <p className={styles.instructionIntro}>
              {accessInstructions.intro}
            </p>
          ) : null}

          {accessInstructions.links.length > 0 ? (
            <div className={styles.accessGrid}>
              {accessInstructions.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.accessLink}
                >
                  <span>
                    <strong>{link.title}</strong>
                    <small>{link.host}</small>
                  </span>
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          ) : (
            <p className={styles.instructionBody}>{thankYouMessage}</p>
          )}

          {accessInstructions.note ? (
            <div className={styles.noteBox}>
              <strong>Important</strong>
              <p>{accessInstructions.note}</p>
            </div>
          ) : null}
        </section>
      )}

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
