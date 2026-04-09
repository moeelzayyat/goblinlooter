import { prisma } from "@/lib/prisma";
import { listAdminProducts, type AdminProductRecord } from "@/lib/admin-products";

export type AdminOrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "review"
  | "cancelled"
  | "refunded"
  | "chargeback";

export type AdminTicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type AdminUserRole = "customer" | "admin";

export interface AdminOrderRecord {
  id: string;
  status: AdminOrderStatus;
  totalAmount: number;
  paymentMethod: string | null;
  btcpayInvoiceId: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    username: string;
    email: string;
    role: AdminUserRole;
    flaggedAt: string | null;
    flagReason: string | null;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    productId: string;
    productTitle: string;
    productSlug: string | null;
  }[];
  key: {
    id: string;
    status: string;
    keyValue: string;
  } | null;
  meta: {
    id: string;
    ipAddress: string;
    userAgent: string;
    country: string | null;
    fingerprint: string | null;
    txId: string | null;
    paymentMethod: string | null;
    riskFlags: string[];
    createdAt: string;
  } | null;
}

export interface AdminCustomerRecord {
  id: string;
  username: string;
  email: string;
  role: AdminUserRole;
  flaggedAt: string | null;
  flagReason: string | null;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  lifetimeValue: number;
  lastOrderAt: string | null;
  openTicketCount: number;
}

export interface AdminSupportTicketRecord {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: AdminTicketStatus;
  resolution: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    username: string;
    email: string;
    role: AdminUserRole;
  };
}

export interface AdminAnalyticsRecord {
  id: string;
  event: string;
  createdAt: string;
  userId: string | null;
  sessionId: string | null;
  dataSummary: string | null;
}

export interface AdminDashboardOverview {
  productCount: number;
  publishedProductCount: number;
  draftProductCount: number;
  disabledProductCount: number;
  availableKeyCount: number;
  assignedKeyCount: number;
  revokedKeyCount: number;
  totalOrders: number;
  pendingOrders: number;
  reviewOrders: number;
  deliveredOrders: number;
  grossRevenue: number;
  customerCount: number;
  adminCount: number;
  openTickets: number;
}

export interface AdminDashboardData {
  overview: AdminDashboardOverview;
  products: AdminProductRecord[];
  orders: AdminOrderRecord[];
  customers: AdminCustomerRecord[];
  tickets: AdminSupportTicketRecord[];
  analytics: {
    recentEvents: AdminAnalyticsRecord[];
    topEvents: { event: string; count: number }[];
  };
}

const VALID_ORDER_STATUSES: AdminOrderStatus[] = [
  "pending",
  "paid",
  "delivered",
  "review",
  "cancelled",
  "refunded",
  "chargeback",
];

const VALID_TICKET_STATUSES: AdminTicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

const VALID_USER_ROLES: AdminUserRole[] = ["customer", "admin"];

function summarizeJson(value: unknown) {
  if (!value) return null;

  const serialized =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);

  return serialized.length > 240
    ? `${serialized.slice(0, 237)}...`
    : serialized;
}

function serializeOrder(order: Awaited<ReturnType<typeof getOrderSourceById>>) {
  if (!order) return null;

  return {
    id: order.id,
    status: order.status as AdminOrderStatus,
    totalAmount: Number(order.totalAmount),
    paymentMethod: order.paymentMethod,
    btcpayInvoiceId: order.btcpayInvoiceId,
    deliveredAt: order.deliveredAt?.toISOString() || null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: {
      id: order.customer.id,
      username: order.customer.username,
      email: order.customer.email,
      role: order.customer.role as AdminUserRole,
      flaggedAt: order.customer.flaggedAt?.toISOString() || null,
      flagReason: order.customer.flagReason,
    },
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      productId: item.productId,
      productTitle: item.product?.title || "Unknown Product",
      productSlug: item.product?.slug || null,
    })),
    key: order.key
      ? {
          id: order.key.id,
          status: order.key.status,
          keyValue: order.key.keyValue,
        }
      : null,
    meta: order.meta
      ? {
          id: order.meta.id,
          ipAddress: order.meta.ipAddress,
          userAgent: order.meta.userAgent,
          country: order.meta.country,
          fingerprint: order.meta.fingerprint,
          txId: order.meta.txId,
          paymentMethod: order.meta.paymentMethod,
          riskFlags: order.meta.riskFlags,
          createdAt: order.meta.createdAt.toISOString(),
        }
      : null,
  } satisfies AdminOrderRecord;
}

function serializeCustomer(
  customer: Awaited<ReturnType<typeof getCustomerSourceById>>
) {
  if (!customer) return null;

  const totalOrders = customer.orders.length;
  const lifetimeValue = customer.orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );
  const lastOrderAt = customer.orders[0]?.createdAt?.toISOString() || null;
  const openTicketCount = customer.supportTickets.filter(
    (ticket) => ticket.status === "open" || ticket.status === "in_progress"
  ).length;

  return {
    id: customer.id,
    username: customer.username,
    email: customer.email,
    role: customer.role as AdminUserRole,
    flaggedAt: customer.flaggedAt?.toISOString() || null,
    flagReason: customer.flagReason,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    totalOrders,
    lifetimeValue,
    lastOrderAt,
    openTicketCount,
  } satisfies AdminCustomerRecord;
}

function serializeTicket(ticket: Awaited<ReturnType<typeof getTicketSourceById>>) {
  if (!ticket) return null;

  return {
    id: ticket.id,
    type: ticket.type,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status as AdminTicketStatus,
    resolution: ticket.resolution,
    orderId: ticket.orderId,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    customer: {
      id: ticket.customer.id,
      username: ticket.customer.username,
      email: ticket.customer.email,
      role: ticket.customer.role as AdminUserRole,
    },
  } satisfies AdminSupportTicketRecord;
}

function serializeAnalyticsEvent(
  event: Awaited<ReturnType<typeof listAdminAnalyticsEvents>>[number]
) {
  return {
    id: event.id,
    event: event.event,
    createdAt: event.createdAt.toISOString(),
    userId: event.userId,
    sessionId: event.sessionId,
    dataSummary: summarizeJson(event.data),
  } satisfies AdminAnalyticsRecord;
}

async function getOrderSourceById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          flaggedAt: true,
          flagReason: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      key: {
        select: {
          id: true,
          status: true,
          keyValue: true,
        },
      },
      meta: true,
    },
  });
}

async function getCustomerSourceById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      },
      supportTickets: {
        select: {
          status: true,
        },
      },
    },
  });
}

async function getTicketSourceById(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function listAdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          flaggedAt: true,
          flagReason: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      key: {
        select: {
          id: true,
          status: true,
          keyValue: true,
        },
      },
      meta: true,
    },
  });

  return orders.map((order) => serializeOrder(order)!);
}

export async function getAdminOrderById(id: string) {
  const order = await getOrderSourceById(id);
  return serializeOrder(order);
}

export async function listAdminCustomers() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      },
      supportTickets: {
        select: {
          status: true,
        },
      },
    },
  });

  return customers.map((customer) => serializeCustomer(customer)!);
}

export async function getAdminCustomerById(id: string) {
  const customer = await getCustomerSourceById(id);
  return serializeCustomer(customer);
}

export async function listAdminSupportTickets() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return tickets.map((ticket) => serializeTicket(ticket)!);
}

export async function getAdminSupportTicketById(id: string) {
  const ticket = await getTicketSourceById(id);
  return serializeTicket(ticket);
}

export async function listAdminAnalyticsEvents(limit = 40) {
  return prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [products, orders, customers, tickets, recentEvents] = await Promise.all([
    listAdminProducts(),
    listAdminOrders(),
    listAdminCustomers(),
    listAdminSupportTickets(),
    listAdminAnalyticsEvents(60),
  ]);

  const topEventsMap = new Map<string, number>();
  for (const event of recentEvents) {
    topEventsMap.set(event.event, (topEventsMap.get(event.event) || 0) + 1);
  }

  const topEvents = [...topEventsMap.entries()]
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const overview: AdminDashboardOverview = {
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
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    reviewOrders: orders.filter((order) => order.status === "review").length,
    deliveredOrders: orders.filter((order) => order.status === "delivered").length,
    grossRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    customerCount: customers.filter((customer) => customer.role === "customer").length,
    adminCount: customers.filter((customer) => customer.role === "admin").length,
    openTickets: tickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "in_progress"
    ).length,
  };

  return {
    overview,
    products,
    orders,
    customers,
    tickets,
    analytics: {
      recentEvents: recentEvents.map(serializeAnalyticsEvent),
      topEvents,
    },
  };
}

export function normalizeAdminOrderStatus(value: unknown) {
  if (typeof value !== "string" || !VALID_ORDER_STATUSES.includes(value as AdminOrderStatus)) {
    return { error: "Order status is invalid." as const };
  }

  return { status: value as AdminOrderStatus };
}

export function normalizeAdminTicketUpdate(input: Record<string, unknown>) {
  const status = input.status;
  const resolution =
    typeof input.resolution === "string" && input.resolution.trim()
      ? input.resolution.trim()
      : null;

  if (typeof status !== "string" || !VALID_TICKET_STATUSES.includes(status as AdminTicketStatus)) {
    return { error: "Ticket status is invalid." as const };
  }

  return {
    data: {
      status: status as AdminTicketStatus,
      resolution,
    },
  };
}

export function normalizeAdminCustomerUpdate(input: Record<string, unknown>) {
  const role = input.role;
  const flagged = Boolean(input.flagged);
  const flagReason =
    typeof input.flagReason === "string" && input.flagReason.trim()
      ? input.flagReason.trim()
      : null;

  if (typeof role !== "string" || !VALID_USER_ROLES.includes(role as AdminUserRole)) {
    return { error: "User role is invalid." as const };
  }

  return {
    data: {
      role: role as AdminUserRole,
      flaggedAt: flagged ? new Date() : null,
      flagReason: flagged ? flagReason || "Flagged by admin" : null,
    },
  };
}
