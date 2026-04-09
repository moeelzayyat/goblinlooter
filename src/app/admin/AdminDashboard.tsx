"use client";

import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { Button } from "@/components/ui/Button";
import type {
  AdminCustomerRecord,
  AdminDashboardData,
  AdminOrderRecord,
  AdminSupportTicketRecord,
} from "@/lib/admin-dashboard";
import type {
  AdminInventoryKeyRecord,
  AdminProductRecord,
} from "@/lib/admin-products";
import styles from "./page.module.css";

type AdminSection =
  | "overview"
  | "products"
  | "orders"
  | "customers"
  | "tickets"
  | "analytics";

const SECTION_OPTIONS: { id: AdminSection; label: string; description: string }[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Revenue, inventory, and items needing attention.",
  },
  {
    id: "products",
    label: "Products",
    description: "Catalog, pricing, keys, and storefront availability.",
  },
  {
    id: "orders",
    label: "Orders",
    description: "Payments, delivery status, invoices, and order risk data.",
  },
  {
    id: "customers",
    label: "Customers",
    description: "Roles, flags, customer history, and support load.",
  },
  {
    id: "tickets",
    label: "Support",
    description: "Refunds, delivery issues, and ticket resolutions.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Live event feed and top site activity.",
  },
];

const CATEGORY_OPTIONS = [
  { value: "tool-access", label: "Tool Access" },
  { value: "game-keys", label: "Game Keys" },
  { value: "configs", label: "Configs" },
];

const DELIVERY_OPTIONS = [
  { value: "key", label: "Digital Key" },
  { value: "download", label: "Digital Download" },
  { value: "manual", label: "Manual Delivery" },
];

const REFUND_OPTIONS = [
  { value: "eligible", label: "Eligible" },
  { value: "conditional", label: "Conditional" },
  { value: "non-refundable", label: "Non-refundable" },
];

const PRODUCT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "disabled", label: "Disabled" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "delivered", label: "Delivered" },
  { value: "review", label: "Review" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "chargeback", label: "Chargeback" },
];

const USER_ROLE_OPTIONS = [
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
];

const TICKET_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatCompactDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function createEmptyProductForm() {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    category: "tool-access",
    price: "60",
    platform: "Windows 10/11",
    compatibilityNotes: "Latest loader build",
    regionRestrictions: "",
    deliveryMethod: "key",
    downloadUrl: "",
    deliveryTimeEstimate: "Instant delivery",
    refundEligibility: "conditional",
    refundTerms: "Refunds are available on unused keys within 72 hours.",
    images: "/arcway-dupe.png",
    featured: true,
    status: "published",
  };
}

type ProductFormState = ReturnType<typeof createEmptyProductForm>;

function formFromProduct(product: AdminProductRecord): ProductFormState {
  return {
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    category: product.category,
    price: product.price.toString(),
    platform: product.platform.join("\n"),
    compatibilityNotes: product.compatibilityNotes,
    regionRestrictions: product.regionRestrictions || "",
    deliveryMethod: product.deliveryMethod,
    downloadUrl: product.downloadUrl || "",
    deliveryTimeEstimate: product.deliveryTimeEstimate,
    refundEligibility: product.refundEligibility,
    refundTerms: product.refundTerms,
    images: product.images.join("\n"),
    featured: product.featured,
    status: product.status,
  };
}

function computeOverview(
  products: AdminProductRecord[],
  orders: AdminOrderRecord[],
  customers: AdminCustomerRecord[],
  tickets: AdminSupportTicketRecord[]
) {
  return {
    productCount: products.length,
    publishedProductCount: products.filter((product) => product.status === "published")
      .length,
    draftProductCount: products.filter((product) => product.status === "draft").length,
    disabledProductCount: products.filter((product) => product.status === "disabled")
      .length,
    availableKeyCount: products.reduce(
      (sum, product) => sum + product.availableKeyCount,
      0
    ),
    assignedKeyCount: products.reduce(
      (sum, product) => sum + product.assignedKeyCount,
      0
    ),
    revokedKeyCount: products.reduce(
      (sum, product) => sum + product.revokedKeyCount,
      0
    ),
    grossRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    reviewOrders: orders.filter((order) => order.status === "review").length,
    deliveredOrders: orders.filter((order) => order.status === "delivered").length,
    customerCount: customers.filter((customer) => customer.role === "customer").length,
    adminCount: customers.filter((customer) => customer.role === "admin").length,
    openTickets: tickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "in_progress"
    ).length,
  };
}

export function AdminDashboard({
  initialData,
}: {
  initialData: AdminDashboardData;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [products, setProducts] = useState(initialData.products);
  const [orders, setOrders] = useState(initialData.orders);
  const [customers, setCustomers] = useState(initialData.customers);
  const [tickets, setTickets] = useState(initialData.tickets);
  const [analytics] = useState(initialData.analytics);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialData.products[0]?.id || null
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialData.orders[0]?.id || null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialData.customers[0]?.id || null
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialData.tickets[0]?.id || null
  );

  const [productForm, setProductForm] = useState<ProductFormState>(
    initialData.products[0]
      ? formFromProduct(initialData.products[0])
      : createEmptyProductForm()
  );
  const [keyInput, setKeyInput] = useState("");
  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>({});
  const [orderStatus, setOrderStatus] = useState(
    initialData.orders[0]?.status || "pending"
  );
  const [customerRole, setCustomerRole] = useState(
    initialData.customers[0]?.role || "customer"
  );
  const [customerFlagged, setCustomerFlagged] = useState(
    Boolean(initialData.customers[0]?.flaggedAt)
  );
  const [customerFlagReason, setCustomerFlagReason] = useState(
    initialData.customers[0]?.flagReason || ""
  );
  const [ticketStatus, setTicketStatus] = useState(
    initialData.tickets[0]?.status || "open"
  );
  const [ticketResolution, setTicketResolution] = useState(
    initialData.tickets[0]?.resolution || ""
  );

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [addingKeys, setAddingKeys] = useState(false);
  const [keyAction, setKeyAction] = useState<{
    id: string;
    mode: "save" | "delete" | "clear";
  } | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId]
  );
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );
  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );
  const overview = useMemo(
    () => computeOverview(products, orders, customers, tickets),
    [products, orders, customers, tickets]
  );
  const removableKeyCount = selectedProduct
    ? selectedProduct.inventoryKeys.filter(
        (key) => key.status !== "assigned" && !key.orderId
      ).length
    : 0;
  const lockedKeyCount = selectedProduct
    ? selectedProduct.inventoryKeys.length - removableKeyCount
    : 0;

  useEffect(() => {
    if (!selectedProduct) {
      setProductForm(createEmptyProductForm());
      setKeyInput("");
      setKeyDrafts({});
      return;
    }

    setProductForm(formFromProduct(selectedProduct));
    setKeyInput("");
    setKeyDrafts(
      Object.fromEntries(
        selectedProduct.inventoryKeys.map((key) => [key.id, key.keyValue])
      )
    );
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedOrder) {
      setOrderStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (!selectedCustomer) return;
    setCustomerRole(selectedCustomer.role);
    setCustomerFlagged(Boolean(selectedCustomer.flaggedAt));
    setCustomerFlagReason(selectedCustomer.flagReason || "");
  }, [selectedCustomer]);

  useEffect(() => {
    if (!selectedTicket) return;
    setTicketStatus(selectedTicket.status);
    setTicketResolution(selectedTicket.resolution || "");
  }, [selectedTicket]);

  function clearBanner() {
    setMessage(null);
    setError(null);
  }

  function updateProductField<K extends keyof ProductFormState>(
    name: K,
    value: ProductFormState[K]
  ) {
    setProductForm((current) => ({ ...current, [name]: value }));
  }

  function updateProductState(product: AdminProductRecord) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (!exists) return [product, ...current];
      return current.map((item) => (item.id === product.id ? product : item));
    });
    setSelectedProductId(product.id);
  }

  function removeProductState(productId: string) {
    const nextProducts = products.filter((product) => product.id !== productId);
    setProducts(nextProducts);

    if (selectedProductId === productId) {
      setSelectedProductId(nextProducts[0]?.id || null);
    }
  }

  function updateOrderState(order: AdminOrderRecord) {
    setOrders((current) =>
      current.map((item) => (item.id === order.id ? order : item))
    );
    setSelectedOrderId(order.id);
  }

  function updateCustomerState(customer: AdminCustomerRecord) {
    setCustomers((current) =>
      current.map((item) => (item.id === customer.id ? customer : item))
    );
    setSelectedCustomerId(customer.id);
  }

  function updateTicketState(ticket: AdminSupportTicketRecord) {
    setTickets((current) =>
      current.map((item) => (item.id === ticket.id ? ticket : item))
    );
    setSelectedTicketId(ticket.id);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProduct(true);
    clearBanner();

    try {
      const response = await fetch(
        selectedProduct
          ? `/api/admin/products/${selectedProduct.id}`
          : "/api/admin/products",
        {
          method: selectedProduct ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productForm),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save product.");
      }

      updateProductState(data.product as AdminProductRecord);
      setMessage(selectedProduct ? "Product updated." : "Product created.");
      setActiveSection("products");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct() {
    if (!selectedProduct) return;

    const confirmed = window.confirm(
      `Delete ${selectedProduct.title}? Products with existing orders cannot be deleted.`
    );
    if (!confirmed) return;

    setDeletingProduct(true);
    clearBanner();

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete product.");
      }

      removeProductState(selectedProduct.id);
      setMessage("Product deleted.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete product."
      );
    } finally {
      setDeletingProduct(false);
    }
  }

  async function addKeys() {
    if (!selectedProduct) return;

    setAddingKeys(true);
    clearBanner();

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}/keys`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: keyInput }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add keys.");
      }

      updateProductState(data.product as AdminProductRecord);
      setKeyInput("");
      setMessage(`Added ${data.addedCount} key${data.addedCount === 1 ? "" : "s"}.`);
    } catch (keyError) {
      setError(keyError instanceof Error ? keyError.message : "Unable to add keys.");
    } finally {
      setAddingKeys(false);
    }
  }

  function updateKeyDraft(keyId: string, value: string) {
    setKeyDrafts((current) => ({ ...current, [keyId]: value }));
  }

  async function saveKey(key: AdminInventoryKeyRecord) {
    if (!selectedProduct) return;

    const nextValue = keyDrafts[key.id]?.trim() || "";
    if (!nextValue || nextValue === key.keyValue) return;

    setKeyAction({ id: key.id, mode: "save" });
    clearBanner();

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}/keys/${key.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyValue: nextValue }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update key.");
      }

      updateProductState(data.product as AdminProductRecord);
      setMessage("Key updated.");
    } catch (keyError) {
      setError(
        keyError instanceof Error ? keyError.message : "Unable to update key."
      );
    } finally {
      setKeyAction(null);
    }
  }

  async function deleteKey(key: AdminInventoryKeyRecord) {
    if (!selectedProduct) return;
    if (!window.confirm("Remove this key from inventory?")) return;

    setKeyAction({ id: key.id, mode: "delete" });
    clearBanner();

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}/keys/${key.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete key.");
      }

      updateProductState(data.product as AdminProductRecord);
      setMessage("Key removed.");
    } catch (keyError) {
      setError(
        keyError instanceof Error ? keyError.message : "Unable to delete key."
      );
    } finally {
      setKeyAction(null);
    }
  }

  async function deleteAllKeys() {
    if (!selectedProduct) return;

    if (removableKeyCount === 0) {
      setError("There are no removable keys on this product.");
      setMessage(null);
      return;
    }

    const confirmed = window.confirm(
      `Delete ${removableKeyCount} removable key${
        removableKeyCount === 1 ? "" : "s"
      } from this product?\n\nAssigned keys stay protected.${
        lockedKeyCount > 0
          ? ` ${lockedKeyCount} locked key${
              lockedKeyCount === 1 ? "" : "s"
            } will be kept.`
          : ""
      }`
    );

    if (!confirmed) return;

    setKeyAction({ id: selectedProduct.id, mode: "clear" });
    clearBanner();

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/keys`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete keys.");
      }

      updateProductState(data.product as AdminProductRecord);
      setMessage(
        `Removed ${data.removedCount} key${data.removedCount === 1 ? "" : "s"}.${
          data.lockedCount
            ? ` ${data.lockedCount} assigned key${data.lockedCount === 1 ? "" : "s"} were kept.`
            : ""
        }`
      );
    } catch (keyError) {
      setError(
        keyError instanceof Error ? keyError.message : "Unable to delete keys."
      );
    } finally {
      setKeyAction(null);
    }
  }

  async function saveOrder() {
    if (!selectedOrder) return;

    setSavingOrder(true);
    clearBanner();

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: orderStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update order.");
      }

      updateOrderState(data.order as AdminOrderRecord);
      setMessage("Order updated.");
    } catch (orderError) {
      setError(
        orderError instanceof Error ? orderError.message : "Unable to update order."
      );
    } finally {
      setSavingOrder(false);
    }
  }

  async function saveCustomer() {
    if (!selectedCustomer) return;

    setSavingCustomer(true);
    clearBanner();

    try {
      const response = await fetch(`/api/admin/users/${selectedCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: customerRole,
          flagged: customerFlagged,
          flagReason: customerFlagReason,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update customer.");
      }

      updateCustomerState(data.customer as AdminCustomerRecord);
      setMessage("Customer updated.");
    } catch (customerError) {
      setError(
        customerError instanceof Error
          ? customerError.message
          : "Unable to update customer."
      );
    } finally {
      setSavingCustomer(false);
    }
  }

  async function saveTicket() {
    if (!selectedTicket) return;

    setSavingTicket(true);
    clearBanner();

    try {
      const response = await fetch(`/api/admin/support/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: ticketStatus,
          resolution: ticketResolution,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update ticket.");
      }

      updateTicketState(data.ticket as AdminSupportTicketRecord);
      setMessage("Ticket updated.");
    } catch (ticketError) {
      setError(
        ticketError instanceof Error ? ticketError.message : "Unable to update ticket."
      );
    } finally {
      setSavingTicket(false);
    }
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Admin Panel</p>
            <h1 className={styles.title}>Run the whole storefront from one place</h1>
            <p className={styles.subtitle}>
              Catalog, keys, orders, customers, tickets, and site activity now live
              in one operations dashboard instead of a single product form.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Button
              type="button"
              onClick={() => {
                setActiveSection("products");
                setSelectedProductId(null);
                clearBanner();
              }}
            >
              New Product
            </Button>
          </div>
        </section>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <section className={styles.sectionTabs}>
          {SECTION_OPTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.sectionTab} ${
                activeSection === section.id ? styles.sectionTabActive : ""
              }`}
              onClick={() => {
                setActiveSection(section.id);
                clearBanner();
              }}
            >
              <span className={styles.sectionTabLabel}>{section.label}</span>
              <span className={styles.sectionTabDescription}>
                {section.description}
              </span>
            </button>
          ))}
        </section>

        {activeSection === "overview" && (
          <section className={styles.dashboardStack}>
            <div className={styles.statsGrid}>
              {[
                {
                  label: "Gross revenue",
                  value: formatCurrency(overview.grossRevenue),
                  tone: "accent",
                },
                {
                  label: "Live products",
                  value: `${overview.publishedProductCount}/${overview.productCount}`,
                  tone: "default",
                },
                {
                  label: "Available keys",
                  value: overview.availableKeyCount.toString(),
                  tone: "default",
                },
                {
                  label: "Orders needing action",
                  value: `${overview.pendingOrders + overview.reviewOrders}`,
                  tone: "warning",
                },
                {
                  label: "Open tickets",
                  value: overview.openTickets.toString(),
                  tone: "danger",
                },
                {
                  label: "Customers",
                  value: `${overview.customerCount} users`,
                  tone: "default",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${styles.statCard} ${
                    stat.tone === "accent"
                      ? styles.statCardAccent
                      : stat.tone === "warning"
                        ? styles.statCardWarning
                        : stat.tone === "danger"
                          ? styles.statCardDanger
                          : ""
                  }`}
                >
                  <span className={styles.statLabel}>{stat.label}</span>
                  <strong className={styles.statValue}>{stat.value}</strong>
                </div>
              ))}
            </div>

            <div className={styles.twoColumnGrid}>
              <div className={styles.surfaceCard}>
                <div className={styles.surfaceHeader}>
                  <div>
                    <h2>Recent Orders</h2>
                    <p>The latest payments and delivery states.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveSection("orders")}
                  >
                    Open Orders
                  </Button>
                </div>
                <div className={styles.dataList}>
                  {orders.slice(0, 6).map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      className={styles.dataRow}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setActiveSection("orders");
                      }}
                    >
                      <div>
                        <strong>{order.customer.username}</strong>
                        <p>{order.items[0]?.productTitle || "Unknown product"}</p>
                      </div>
                      <div className={styles.dataRowMeta}>
                        <span className={styles.badge}>{order.status}</span>
                        <span>{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.surfaceCard}>
                <div className={styles.surfaceHeader}>
                  <div>
                    <h2>Tickets Needing Attention</h2>
                    <p>Newest unresolved support requests.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveSection("tickets")}
                  >
                    Open Support
                  </Button>
                </div>
                <div className={styles.dataList}>
                  {tickets
                    .filter(
                      (ticket) =>
                        ticket.status === "open" || ticket.status === "in_progress"
                    )
                    .slice(0, 6)
                    .map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        className={styles.dataRow}
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setActiveSection("tickets");
                        }}
                      >
                        <div>
                          <strong>{ticket.subject}</strong>
                          <p>
                            {ticket.customer.username} · {ticket.type.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div className={styles.dataRowMeta}>
                          <span className={styles.badge}>{ticket.status}</span>
                          <span>{formatCompactDate(ticket.updatedAt)}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className={styles.threeColumnGrid}>
              <div className={styles.surfaceCard}>
                <div className={styles.surfaceHeader}>
                  <div>
                    <h2>Catalog Health</h2>
                    <p>Storefront coverage and inventory posture.</p>
                  </div>
                </div>
                <div className={styles.metricList}>
                  <div className={styles.metricRow}>
                    <span>Published</span>
                    <strong>{overview.publishedProductCount}</strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Draft</span>
                    <strong>{overview.draftProductCount}</strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Disabled</span>
                    <strong>{overview.disabledProductCount}</strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Assigned keys</span>
                    <strong>{overview.assignedKeyCount}</strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Revoked keys</span>
                    <strong>{overview.revokedKeyCount}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.surfaceCard}>
                <div className={styles.surfaceHeader}>
                  <div>
                    <h2>Customer Risk</h2>
                    <p>Quick check on flagged users and admin access.</p>
                  </div>
                </div>
                <div className={styles.metricList}>
                  <div className={styles.metricRow}>
                    <span>Admins</span>
                    <strong>{overview.adminCount}</strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Flagged users</span>
                    <strong>
                      {customers.filter((customer) => Boolean(customer.flaggedAt)).length}
                    </strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Users with open tickets</span>
                    <strong>
                      {customers.filter((customer) => customer.openTicketCount > 0).length}
                    </strong>
                  </div>
                </div>
              </div>

              <div className={styles.surfaceCard}>
                <div className={styles.surfaceHeader}>
                  <div>
                    <h2>Top Activity</h2>
                    <p>Most frequent recent events across the site.</p>
                  </div>
                </div>
                <div className={styles.metricList}>
                  {analytics.topEvents.slice(0, 5).map((event) => (
                    <div key={event.event} className={styles.metricRow}>
                      <span>{event.event.replace(/_/g, " ")}</span>
                      <strong>{event.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === "products" && (
          <section className={styles.sectionGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>Catalog</div>
              <div className={styles.productList}>
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`${styles.productCard} ${
                      selectedProductId === product.id ? styles.productCardActive : ""
                    }`}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      clearBanner();
                    }}
                  >
                    <div className={styles.productTop}>
                      <span>{product.title}</span>
                      <span className={styles.price}>{formatCurrency(product.price)}</span>
                    </div>
                    <div className={styles.productMeta}>
                      <span>{product.status}</span>
                      <span>{product.slug}</span>
                    </div>
                    <div className={styles.productCounts}>
                      <span>{product.availableKeyCount} available</span>
                      <span>{product.assignedKeyCount} assigned</span>
                    </div>
                  </button>
                ))}
                {products.length === 0 && (
                  <div className={styles.emptyState}>No products yet. Create the first one.</div>
                )}
              </div>
            </aside>

            <div className={styles.editorStack}>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2>{selectedProduct ? "Product Editor" : "Create Product"}</h2>
                    <p>
                      Control storefront copy, delivery rules, URLs, and product
                      visibility from one form.
                    </p>
                  </div>
                  {selectedProduct && (
                    <div className={styles.inlineActions}>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setSelectedProductId(null);
                          clearBanner();
                        }}
                      >
                        Create Another
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        loading={deletingProduct}
                        onClick={deleteProduct}
                      >
                        Delete Product
                      </Button>
                    </div>
                  )}
                </div>

                <form className={styles.form} onSubmit={saveProduct}>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Title</span>
                      <input
                        value={productForm.title}
                        onChange={(event) =>
                          updateProductField("title", event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Slug</span>
                      <input
                        value={productForm.slug}
                        onChange={(event) =>
                          updateProductField("slug", event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Price (USD)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={productForm.price}
                        onChange={(event) =>
                          updateProductField("price", event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Category</span>
                      <select
                        value={productForm.category}
                        onChange={(event) =>
                          updateProductField("category", event.target.value)
                        }
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Status</span>
                      <select
                        value={productForm.status}
                        onChange={(event) =>
                          updateProductField("status", event.target.value)
                        }
                      >
                        {PRODUCT_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <small className={styles.fieldHint}>
                        Only published products appear on the live shop.
                      </small>
                    </label>
                    <label className={styles.field}>
                      <span>Delivery Method</span>
                      <select
                        value={productForm.deliveryMethod}
                        onChange={(event) =>
                          updateProductField("deliveryMethod", event.target.value)
                        }
                      >
                        {DELIVERY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Delivery ETA</span>
                      <input
                        value={productForm.deliveryTimeEstimate}
                        onChange={(event) =>
                          updateProductField("deliveryTimeEstimate", event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Refund Eligibility</span>
                      <select
                        value={productForm.refundEligibility}
                        onChange={(event) =>
                          updateProductField("refundEligibility", event.target.value)
                        }
                      >
                        {REFUND_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Download URL</span>
                      <input
                        value={productForm.downloadUrl}
                        onChange={(event) =>
                          updateProductField("downloadUrl", event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Region Restrictions</span>
                      <input
                        value={productForm.regionRestrictions}
                        onChange={(event) =>
                          updateProductField("regionRestrictions", event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span>Short Description</span>
                    <textarea
                      rows={3}
                      value={productForm.shortDescription}
                      onChange={(event) =>
                        updateProductField("shortDescription", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Full Description</span>
                    <textarea
                      rows={5}
                      value={productForm.fullDescription}
                      onChange={(event) =>
                        updateProductField("fullDescription", event.target.value)
                      }
                    />
                  </label>

                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Platforms</span>
                      <textarea
                        rows={4}
                        value={productForm.platform}
                        onChange={(event) =>
                          updateProductField("platform", event.target.value)
                        }
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Images</span>
                      <textarea
                        rows={4}
                        value={productForm.images}
                        onChange={(event) =>
                          updateProductField("images", event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span>Compatibility Notes</span>
                    <textarea
                      rows={3}
                      value={productForm.compatibilityNotes}
                      onChange={(event) =>
                        updateProductField("compatibilityNotes", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Refund Terms</span>
                    <textarea
                      rows={3}
                      value={productForm.refundTerms}
                      onChange={(event) =>
                        updateProductField("refundTerms", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(event) =>
                        updateProductField("featured", event.target.checked)
                      }
                    />
                    <span>Feature this product on the homepage storefront</span>
                  </label>

                  <div className={styles.actions}>
                    <Button type="submit" loading={savingProduct}>
                      {selectedProduct ? "Save Product" : "Create Product"}
                    </Button>
                  </div>
                </form>
              </section>

              {selectedProduct && (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h2>Key Inventory</h2>
                      <p>
                        Available: {selectedProduct.availableKeyCount} · Assigned:{" "}
                        {selectedProduct.assignedKeyCount} · Revoked:{" "}
                        {selectedProduct.revokedKeyCount}
                      </p>
                    </div>
                    <div className={styles.inlineActions}>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={removableKeyCount === 0}
                        loading={
                          keyAction?.id === selectedProduct.id &&
                          keyAction.mode === "clear"
                        }
                        onClick={deleteAllKeys}
                      >
                        Delete All Removable
                      </Button>
                    </div>
                  </div>

                  <label className={styles.field}>
                    <span>Paste keys, one per line</span>
                    <textarea
                      rows={6}
                      value={keyInput}
                      onChange={(event) => setKeyInput(event.target.value)}
                      placeholder={"KEY-1234-AAAA\nKEY-5678-BBBB"}
                    />
                  </label>
                  <div className={styles.actions}>
                    <Button type="button" onClick={addKeys} loading={addingKeys}>
                      Add Keys
                    </Button>
                    <span className={styles.helperText}>
                      Bulk delete removes only available or revoked keys. Assigned
                      keys stay protected.
                    </span>
                  </div>

                  <div className={styles.keyManager}>
                    <div className={styles.keyManagerHeader}>
                      <div>
                        <h3>Existing Keys</h3>
                        <p>
                          Edit or remove available inventory. Order-linked keys are
                          locked.
                        </p>
                      </div>
                      <span className={styles.keyCount}>
                        {selectedProduct.inventoryKeys.length} total
                      </span>
                    </div>

                    <div className={styles.keyList}>
                      {selectedProduct.inventoryKeys.length === 0 ? (
                        <div className={styles.keyEmpty}>
                          No keys yet. Add your first batch above.
                        </div>
                      ) : (
                        selectedProduct.inventoryKeys.map((key) => {
                          const locked = key.status === "assigned" || Boolean(key.orderId);
                          const draftValue = keyDrafts[key.id] ?? key.keyValue;
                          const changed = draftValue.trim() !== key.keyValue;
                          const acting = keyAction?.id === key.id;

                          return (
                            <div key={key.id} className={styles.keyRow}>
                              <div className={styles.keyRowTop}>
                                <span
                                  className={`${styles.keyStatus} ${
                                    key.status === "available"
                                      ? styles.keyStatusAvailable
                                      : key.status === "assigned"
                                        ? styles.keyStatusAssigned
                                        : styles.keyStatusRevoked
                                  }`}
                                >
                                  {key.status}
                                </span>
                                <span className={styles.keyMeta}>
                                  Added {formatDateTime(key.createdAt)}
                                </span>
                              </div>
                              <textarea
                                className={styles.keyValueInput}
                                rows={2}
                                value={draftValue}
                                disabled={locked || acting}
                                onChange={(event) =>
                                  updateKeyDraft(key.id, event.target.value)
                                }
                              />
                              <div className={styles.keyActions}>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  disabled={!changed || locked}
                                  loading={acting && keyAction?.mode === "save"}
                                  onClick={() => saveKey(key)}
                                >
                                  Save Key
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="danger"
                                  disabled={locked}
                                  loading={acting && keyAction?.mode === "delete"}
                                  onClick={() => deleteKey(key)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </section>
        )}

        {activeSection === "orders" && (
          <section className={styles.sectionGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>Orders</div>
              <div className={styles.productList}>
                {orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className={`${styles.productCard} ${
                      selectedOrderId === order.id ? styles.productCardActive : ""
                    }`}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      clearBanner();
                    }}
                  >
                    <div className={styles.productTop}>
                      <span>{order.customer.username}</span>
                      <span className={styles.price}>{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className={styles.productMeta}>
                      <span>{order.status}</span>
                      <span>{formatCompactDate(order.createdAt)}</span>
                    </div>
                    <div className={styles.productCounts}>
                      <span>{order.items[0]?.productTitle || "Unknown product"}</span>
                      <span>{order.paymentMethod || "No method"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className={styles.panel}>
              {selectedOrder ? (
                <>
                  <div className={styles.panelHeader}>
                    <div>
                      <h2>Order Control</h2>
                      <p>
                        Order {selectedOrder.id} · {selectedOrder.customer.email}
                      </p>
                    </div>
                    <div className={styles.inlineActions}>
                      <Button type="button" loading={savingOrder} onClick={saveOrder}>
                        Save Order
                      </Button>
                    </div>
                  </div>

                  <div className={styles.detailGrid}>
                    <label className={styles.field}>
                      <span>Status</span>
                      <select
                        value={orderStatus}
                        onChange={(event) => setOrderStatus(event.target.value)}
                      >
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className={styles.detailCard}>
                      <span>Total</span>
                      <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Payment</span>
                      <strong>{selectedOrder.paymentMethod || "Unknown"}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Created</span>
                      <strong>{formatDateTime(selectedOrder.createdAt)}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Delivered At</span>
                      <strong>{formatDateTime(selectedOrder.deliveredAt)}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Invoice</span>
                      <strong>{selectedOrder.btcpayInvoiceId || "None"}</strong>
                    </div>
                  </div>

                  <div className={styles.infoGrid}>
                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Customer</h3>
                          <p>{selectedOrder.customer.email}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedCustomerId(selectedOrder.customer.id);
                            setActiveSection("customers");
                          }}
                        >
                          Open Customer
                        </Button>
                      </div>
                      <div className={styles.metricList}>
                        <div className={styles.metricRow}>
                          <span>Username</span>
                          <strong>{selectedOrder.customer.username}</strong>
                        </div>
                        <div className={styles.metricRow}>
                          <span>Role</span>
                          <strong>{selectedOrder.customer.role}</strong>
                        </div>
                        <div className={styles.metricRow}>
                          <span>Flagged</span>
                          <strong>{selectedOrder.customer.flaggedAt ? "Yes" : "No"}</strong>
                        </div>
                        {selectedOrder.customer.flagReason && (
                          <div className={styles.longTextBlock}>
                            {selectedOrder.customer.flagReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Items</h3>
                          <p>Products attached to this purchase.</p>
                        </div>
                      </div>
                      <div className={styles.dataList}>
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className={styles.dataRowStatic}>
                            <div>
                              <strong>{item.productTitle}</strong>
                              <p>
                                Qty {item.quantity} · {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                            <span>{item.productSlug || "No slug"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoGrid}>
                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Delivery</h3>
                          <p>Key and audit context for this order.</p>
                        </div>
                      </div>
                      {selectedOrder.key ? (
                        <div className={styles.metricList}>
                          <div className={styles.metricRow}>
                            <span>Key status</span>
                            <strong>{selectedOrder.key.status}</strong>
                          </div>
                          <div className={styles.longTextBlock}>
                            {selectedOrder.key.keyValue}
                          </div>
                        </div>
                      ) : (
                        <p className={styles.emptyCopy}>No key assigned to this order yet.</p>
                      )}
                    </div>

                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Risk Data</h3>
                          <p>Collected order metadata from checkout.</p>
                        </div>
                      </div>
                      {selectedOrder.meta ? (
                        <div className={styles.metricList}>
                          <div className={styles.metricRow}>
                            <span>Country</span>
                            <strong>{selectedOrder.meta.country || "Unknown"}</strong>
                          </div>
                          <div className={styles.metricRow}>
                            <span>IP</span>
                            <strong>{selectedOrder.meta.ipAddress}</strong>
                          </div>
                          <div className={styles.metricRow}>
                            <span>Payment</span>
                            <strong>{selectedOrder.meta.paymentMethod || "Unknown"}</strong>
                          </div>
                          <div className={styles.metricRow}>
                            <span>TXID</span>
                            <strong>{selectedOrder.meta.txId || "None"}</strong>
                          </div>
                          <div className={styles.longTextBlock}>
                            {selectedOrder.meta.userAgent}
                          </div>
                          <div className={styles.tagWrap}>
                            {selectedOrder.meta.riskFlags.length > 0 ? (
                              selectedOrder.meta.riskFlags.map((flag) => (
                                <span key={flag} className={styles.badge}>
                                  {flag}
                                </span>
                              ))
                            ) : (
                              <span className={styles.emptyCopy}>No risk flags.</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className={styles.emptyCopy}>No metadata stored for this order.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>No orders available yet.</div>
              )}
            </section>
          </section>
        )}

        {activeSection === "customers" && (
          <section className={styles.sectionGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>Customers</div>
              <div className={styles.productList}>
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className={`${styles.productCard} ${
                      selectedCustomerId === customer.id ? styles.productCardActive : ""
                    }`}
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      clearBanner();
                    }}
                  >
                    <div className={styles.productTop}>
                      <span>{customer.username}</span>
                      <span className={styles.badge}>{customer.role}</span>
                    </div>
                    <div className={styles.productMeta}>
                      <span>{customer.email}</span>
                      <span>{customer.totalOrders} orders</span>
                    </div>
                    <div className={styles.productCounts}>
                      <span>{formatCurrency(customer.lifetimeValue)}</span>
                      <span>{customer.openTicketCount} open tickets</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className={styles.panel}>
              {selectedCustomer ? (
                <>
                  <div className={styles.panelHeader}>
                    <div>
                      <h2>Customer Control</h2>
                      <p>
                        {selectedCustomer.username} · {selectedCustomer.email}
                      </p>
                    </div>
                    <div className={styles.inlineActions}>
                      <Button
                        type="button"
                        loading={savingCustomer}
                        onClick={saveCustomer}
                      >
                        Save Customer
                      </Button>
                    </div>
                  </div>

                  <div className={styles.detailGrid}>
                    <label className={styles.field}>
                      <span>Role</span>
                      <select
                        value={customerRole}
                        onChange={(event) => setCustomerRole(event.target.value)}
                      >
                        {USER_ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.toggleField}>
                      <span>Customer flagged</span>
                      <input
                        type="checkbox"
                        checked={customerFlagged}
                        onChange={(event) => setCustomerFlagged(event.target.checked)}
                      />
                    </label>
                    <div className={styles.detailCard}>
                      <span>Total orders</span>
                      <strong>{selectedCustomer.totalOrders}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Lifetime value</span>
                      <strong>{formatCurrency(selectedCustomer.lifetimeValue)}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Last order</span>
                      <strong>{formatDateTime(selectedCustomer.lastOrderAt)}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Open tickets</span>
                      <strong>{selectedCustomer.openTicketCount}</strong>
                    </div>
                  </div>

                  <label className={styles.field}>
                    <span>Flag reason</span>
                    <textarea
                      rows={3}
                      value={customerFlagReason}
                      onChange={(event) => setCustomerFlagReason(event.target.value)}
                      placeholder="Reason for admin flagging or account review"
                    />
                  </label>

                  <div className={styles.infoGrid}>
                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Account Summary</h3>
                          <p>Basic state and moderation context.</p>
                        </div>
                      </div>
                      <div className={styles.metricList}>
                        <div className={styles.metricRow}>
                          <span>Created</span>
                          <strong>{formatDateTime(selectedCustomer.createdAt)}</strong>
                        </div>
                        <div className={styles.metricRow}>
                          <span>Updated</span>
                          <strong>{formatDateTime(selectedCustomer.updatedAt)}</strong>
                        </div>
                        <div className={styles.metricRow}>
                          <span>Flagged</span>
                          <strong>{selectedCustomer.flaggedAt ? "Yes" : "No"}</strong>
                        </div>
                      </div>
                    </div>

                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Recent Order Snapshot</h3>
                          <p>Quick path to their latest order if you need context.</p>
                        </div>
                      </div>
                      <div className={styles.dataList}>
                        {orders
                          .filter((order) => order.customer.id === selectedCustomer.id)
                          .slice(0, 5)
                          .map((order) => (
                            <button
                              key={order.id}
                              type="button"
                              className={styles.dataRow}
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setActiveSection("orders");
                              }}
                            >
                              <div>
                                <strong>{order.items[0]?.productTitle || "Unknown product"}</strong>
                                <p>{formatDateTime(order.createdAt)}</p>
                              </div>
                              <div className={styles.dataRowMeta}>
                                <span className={styles.badge}>{order.status}</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>No customers found.</div>
              )}
            </section>
          </section>
        )}

        {activeSection === "tickets" && (
          <section className={styles.sectionGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>Support Tickets</div>
              <div className={styles.productList}>
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    className={`${styles.productCard} ${
                      selectedTicketId === ticket.id ? styles.productCardActive : ""
                    }`}
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      clearBanner();
                    }}
                  >
                    <div className={styles.productTop}>
                      <span>{ticket.subject}</span>
                      <span className={styles.badge}>{ticket.status}</span>
                    </div>
                    <div className={styles.productMeta}>
                      <span>{ticket.customer.username}</span>
                      <span>{ticket.type.replace(/_/g, " ")}</span>
                    </div>
                    <div className={styles.productCounts}>
                      <span>{formatCompactDate(ticket.updatedAt)}</span>
                      <span>{ticket.orderId || "No order"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className={styles.panel}>
              {selectedTicket ? (
                <>
                  <div className={styles.panelHeader}>
                    <div>
                      <h2>Support Control</h2>
                      <p>
                        {selectedTicket.customer.username} · {selectedTicket.customer.email}
                      </p>
                    </div>
                    <div className={styles.inlineActions}>
                      <Button type="button" loading={savingTicket} onClick={saveTicket}>
                        Save Ticket
                      </Button>
                    </div>
                  </div>

                  <div className={styles.detailGrid}>
                    <label className={styles.field}>
                      <span>Status</span>
                      <select
                        value={ticketStatus}
                        onChange={(event) => setTicketStatus(event.target.value)}
                      >
                        {TICKET_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className={styles.detailCard}>
                      <span>Type</span>
                      <strong>{selectedTicket.type.replace(/_/g, " ")}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Created</span>
                      <strong>{formatDateTime(selectedTicket.createdAt)}</strong>
                    </div>
                    <div className={styles.detailCard}>
                      <span>Updated</span>
                      <strong>{formatDateTime(selectedTicket.updatedAt)}</strong>
                    </div>
                  </div>

                  <div className={styles.infoGrid}>
                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Original Request</h3>
                          <p>{selectedTicket.subject}</p>
                        </div>
                        {selectedTicket.orderId && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedOrderId(selectedTicket.orderId);
                              setActiveSection("orders");
                            }}
                          >
                            Open Order
                          </Button>
                        )}
                      </div>
                      <div className={styles.longTextBlock}>{selectedTicket.message}</div>
                    </div>

                    <div className={styles.surfaceCard}>
                      <div className={styles.surfaceHeader}>
                        <div>
                          <h3>Resolution</h3>
                          <p>Internal admin resolution or final customer response.</p>
                        </div>
                      </div>
                      <label className={styles.field}>
                        <span>Resolution notes</span>
                        <textarea
                          rows={8}
                          value={ticketResolution}
                          onChange={(event) => setTicketResolution(event.target.value)}
                          placeholder="How this case was handled"
                        />
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>No tickets yet.</div>
              )}
            </section>
          </section>
        )}

        {activeSection === "analytics" && (
          <section className={styles.dashboardStack}>
            <div className={styles.twoColumnGrid}>
              <div className={styles.surfaceCard}>
                <div className={styles.surfaceHeader}>
                  <div>
                    <h2>Top Recent Events</h2>
                    <p>Aggregated from the latest tracked site activity.</p>
                  </div>
                </div>
                <div className={styles.metricList}>
                  {analytics.topEvents.map((event) => (
                    <div key={event.event} className={styles.metricRow}>
                      <span>{event.event.replace(/_/g, " ")}</span>
                      <strong>{event.count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.surfaceCard}>
                <div className={styles.surfaceHeader}>
                  <div>
                    <h2>Operational Snapshot</h2>
                    <p>High-level read on storefront throughput.</p>
                  </div>
                </div>
                <div className={styles.metricList}>
                  <div className={styles.metricRow}>
                    <span>Total recent events</span>
                    <strong>{analytics.recentEvents.length}</strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Recent purchases</span>
                    <strong>
                      {
                        analytics.recentEvents.filter((event) => event.event === "purchase")
                          .length
                      }
                    </strong>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Checkout starts</span>
                    <strong>
                      {
                        analytics.recentEvents.filter(
                          (event) => event.event === "checkout_start"
                        ).length
                      }
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.surfaceCard}>
              <div className={styles.surfaceHeader}>
                <div>
                  <h2>Recent Event Feed</h2>
                  <p>Raw recent analytics captured by the storefront.</p>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>When</th>
                      <th>User</th>
                      <th>Session</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentEvents.map((event) => (
                      <tr key={event.id}>
                        <td>{event.event}</td>
                        <td>{formatDateTime(event.createdAt)}</td>
                        <td>{event.userId || "Guest"}</td>
                        <td>{event.sessionId || "—"}</td>
                        <td className={styles.monoCell}>{event.dataSummary || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
