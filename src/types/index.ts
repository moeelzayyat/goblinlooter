/* ───── User & Auth ───── */

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  flaggedAt?: string | null;
  flagReason?: string | null;
  createdAt: string;
}

/* ───── Products ───── */

export type ProductCategory = "game-keys" | "tool-access" | "configs";

export type DeliveryMethod = "key" | "download" | "manual";

export type RefundEligibility = "eligible" | "conditional" | "non-refundable";

export type ProductStatus = "draft" | "published" | "disabled";

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: ProductCategory;
  price: number;
  platform: string[];
  compatibilityNotes: string;
  regionRestrictions?: string | null;
  deliveryMethod: DeliveryMethod;
  downloadUrl?: string | null;
  deliveryTimeEstimate: string;
  refundEligibility: RefundEligibility;
  refundTerms: string;
  images: string[];
  featured: boolean;
  status: ProductStatus;
  stockCount?: number;
  createdAt: string;
}

/* ───── Cart ───── */

export interface CartItem {
  product: Product;
  quantity: number;
}

/* ───── Orders ───── */

export type OrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "review"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "BTC" | "LTC";

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  btcpayInvoiceId?: string | null;
  paymentMethod?: PaymentMethod | null;
  deliveredAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  key?: InventoryKeyPublic | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
}

/* ───── Inventory Keys ───── */

export type KeyStatus = "available" | "assigned" | "revoked";

/** Public-facing key (value only shown when order is DELIVERED) */
export interface InventoryKeyPublic {
  id: string;
  status: KeyStatus;
  keyValue?: string; // only populated when order.status === 'delivered'
}

/* ───── Order Metadata (admin) ───── */

export interface OrderMeta {
  id: string;
  orderId: string;
  ipAddress: string;
  userAgent: string;
  country?: string | null;
  fingerprint?: string | null;
  txId?: string | null;
  paymentMethod?: string | null;
  riskFlags: string[];
}

/* ───── Delivery Audit Log (admin) ───── */

export type AuditAction =
  | "key_assigned"
  | "key_revealed"
  | "key_revoked"
  | "delivery_failed"
  | "refund_processed";

export interface DeliveryAuditLog {
  id: string;
  orderId: string;
  keyId?: string | null;
  action: AuditAction;
  metadata?: Record<string, unknown> | null;
  performedBy?: string | null;
  createdAt: string;
}

/* ───── Support Tickets ───── */

export type TicketType =
  | "refund_request"
  | "delivery_issue"
  | "key_problem"
  | "general";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  orderId?: string | null;
  customerId: string;
  type: TicketType;
  subject: string;
  message: string;
  status: TicketStatus;
  resolution?: string | null;
  createdAt: string;
}

/* ───── Analytics ───── */

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"
  | "purchase"
  | "purchase_review"
  | "refund"
  | "support_ticket";

export interface AnalyticsEvent {
  id: string;
  event: AnalyticsEventType;
  data?: Record<string, unknown> | null;
  userId?: string | null;
  sessionId?: string | null;
  createdAt: string;
}

/* ───── UI Helpers ───── */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
