/* ───── User & Auth ───── */

export type VerificationTier = "unverified" | "verified" | "trusted";

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  memberSince: string;
  verificationTier: VerificationTier;
  rating: number;
  reviewCount: number;
  tradesCompleted: number;
  itemsSold: number;
  responseTime: string;
  disputeRate: number;
}

/* ───── Products & Listings ───── */

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  seller: User;
  category: string;
  compatibility?: string[];
  deliveryEstimate: string;
  createdAt: string;
  status: ListingStatus;
}

export type ListingStatus = "active" | "paused" | "sold" | "removed";

export type ProductCategory =
  | "game-tools"
  | "scripts"
  | "configs"
  | "accounts"
  | "items"
  | "services";

/* ───── Trading ───── */

export interface TradeListing {
  id: string;
  offeredItem: TradeItem;
  wantedItem: TradeItem | null; // null = "Open to offers"
  trader: User;
  game: string;
  createdAt: string;
  status: TradeStatus;
}

export interface TradeItem {
  name: string;
  thumbnailUrl?: string;
  estimatedValue: number;
}

export type TradeStatus =
  | "active"
  | "pending"
  | "completed"
  | "cancelled"
  | "disputed";

export interface TradeRoom {
  id: string;
  yourOffer: TradeItem[];
  theirOffer: TradeItem[];
  partner: User;
  status: TradeRoomStatus;
  yourConfirmed: boolean;
  theirConfirmed: boolean;
  countdownEndsAt?: string;
  chatMessages: ChatMessage[];
}

export type TradeRoomStatus =
  | "negotiating"
  | "awaiting-confirmation"
  | "countdown"
  | "completed"
  | "cancelled"
  | "expired";

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

/* ───── Reviews ───── */

export interface Review {
  id: string;
  reviewer: User;
  rating: number;
  text: string;
  createdAt: string;
}

/* ───── Dashboard / Orders ───── */

export interface DashboardStats {
  activeListings: number;
  pendingOrders: number;
  revenue30d: number;
  averageRating: number;
}

export interface Order {
  id: string;
  item: Product;
  buyer: User;
  price: number;
  status: OrderStatus;
  deadline?: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "fulfilled"
  | "completed"
  | "cancelled"
  | "disputed";

/* ───── UI helpers ───── */

export type StatusVariant =
  | "active"
  | "pending"
  | "completed"
  | "cancelled"
  | "disputed"
  | "suspended";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
