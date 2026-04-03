import type { Product, User, TradeListing, Review } from "@/types";

/* ───── Mock Users ───── */

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    username: "EliteForge",
    avatarUrl: undefined,
    memberSince: "2024-03-15",
    verificationTier: "trusted",
    rating: 4.9,
    reviewCount: 312,
    tradesCompleted: 187,
    itemsSold: 456,
    responseTime: "< 1 hour",
    disputeRate: 0.3,
  },
  {
    id: "u2",
    username: "ScriptVault",
    avatarUrl: undefined,
    memberSince: "2024-08-22",
    verificationTier: "verified",
    rating: 4.7,
    reviewCount: 89,
    tradesCompleted: 45,
    itemsSold: 128,
    responseTime: "< 2 hours",
    disputeRate: 1.1,
  },
  {
    id: "u3",
    username: "NovaBlade",
    avatarUrl: undefined,
    memberSince: "2025-01-10",
    verificationTier: "verified",
    rating: 4.5,
    reviewCount: 34,
    tradesCompleted: 22,
    itemsSold: 67,
    responseTime: "< 4 hours",
    disputeRate: 0,
  },
  {
    id: "u4",
    username: "PixelSmith",
    avatarUrl: undefined,
    memberSince: "2025-06-01",
    verificationTier: "unverified",
    rating: 4.2,
    reviewCount: 8,
    tradesCompleted: 3,
    itemsSold: 12,
    responseTime: "< 12 hours",
    disputeRate: 0,
  },
];

/* ───── Mock Products ───── */

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "AutoFarm Pro — Intelligent Resource Collector",
    description:
      "Advanced farming bot with AI-powered pathfinding, anti-detection measures, and customizable routes. Supports 15+ games.",
    price: 24.99,
    thumbnailUrl: undefined,
    rating: 4.8,
    reviewCount: 214,
    seller: MOCK_USERS[0],
    category: "game-tools",
    compatibility: ["Windows 10/11", "DirectX 11+"],
    deliveryEstimate: "Instant delivery",
    createdAt: "2025-11-20",
    status: "active",
  },
  {
    id: "p2",
    title: "LootRadar — Real-Time Drop Tracker",
    description:
      "Track rare item drops in real time with overlay support. Configurable alerts for high-value spawns.",
    price: 14.99,
    thumbnailUrl: undefined,
    rating: 4.6,
    reviewCount: 98,
    seller: MOCK_USERS[1],
    category: "game-tools",
    deliveryEstimate: "Instant delivery",
    createdAt: "2025-12-05",
    status: "active",
  },
  {
    id: "p3",
    title: "ConfigPack Elite — Optimized Game Settings",
    description:
      "Pre-tuned configurations for competitive FPS games. Includes sensitivity calculators and crosshair presets.",
    price: 9.99,
    thumbnailUrl: undefined,
    rating: 4.9,
    reviewCount: 156,
    seller: MOCK_USERS[0],
    category: "configs",
    deliveryEstimate: "Instant delivery",
    createdAt: "2025-10-15",
    status: "active",
  },
  {
    id: "p4",
    title: "MarketEdge — Trading Price Analyzer",
    description:
      "Real-time price tracking and trend analysis for in-game marketplaces. Alerts, charts, and profit calculators.",
    price: 19.99,
    thumbnailUrl: undefined,
    rating: 4.7,
    reviewCount: 73,
    seller: MOCK_USERS[2],
    category: "scripts",
    deliveryEstimate: "Instant delivery",
    createdAt: "2026-01-08",
    status: "active",
  },
  {
    id: "p5",
    title: "DungeonMapper — Instance Layout Tool",
    description:
      "Automatically maps dungeon layouts and marks key locations. Integrates with popular overlay tools.",
    price: 12.99,
    thumbnailUrl: undefined,
    rating: 4.4,
    reviewCount: 42,
    seller: MOCK_USERS[1],
    category: "game-tools",
    deliveryEstimate: "Instant delivery",
    createdAt: "2026-02-14",
    status: "active",
  },
  {
    id: "p6",
    title: "QuickMacro — Custom Keybind Automation",
    description:
      "Create complex macro sequences with a visual builder. Supports delays, conditions, and loop controls.",
    price: 7.99,
    thumbnailUrl: undefined,
    rating: 4.3,
    reviewCount: 31,
    seller: MOCK_USERS[3],
    category: "scripts",
    deliveryEstimate: "Instant delivery",
    createdAt: "2026-03-01",
    status: "active",
  },
];

/* ───── Mock Trade Listings ───── */

export const MOCK_TRADE_LISTINGS: TradeListing[] = [
  {
    id: "t1",
    offeredItem: {
      name: "Legendary Dragon Blade",
      thumbnailUrl: undefined,
      estimatedValue: 45,
    },
    wantedItem: {
      name: "Enchanted Shield of Fortitude",
      thumbnailUrl: undefined,
      estimatedValue: 52,
    },
    trader: MOCK_USERS[0],
    game: "Dragon's Realm",
    createdAt: "2026-03-28",
    status: "active",
  },
  {
    id: "t2",
    offeredItem: {
      name: "Rare Mount: Shadow Stallion",
      thumbnailUrl: undefined,
      estimatedValue: 120,
    },
    wantedItem: null,
    trader: MOCK_USERS[2],
    game: "Dragon's Realm",
    createdAt: "2026-03-30",
    status: "active",
  },
  {
    id: "t3",
    offeredItem: {
      name: "Max-Level Account (Season 12)",
      thumbnailUrl: undefined,
      estimatedValue: 200,
    },
    wantedItem: {
      name: "Premium Currency Bundle (5000+)",
      thumbnailUrl: undefined,
      estimatedValue: 180,
    },
    trader: MOCK_USERS[1],
    game: "Star Conflict",
    createdAt: "2026-04-01",
    status: "active",
  },
];

/* ───── Mock Reviews ───── */

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    reviewer: MOCK_USERS[2],
    rating: 5,
    text: "Works perfectly. Setup took 2 minutes and it's been running flawlessly for weeks. Seller was responsive to questions.",
    createdAt: "2026-03-25",
  },
  {
    id: "r2",
    reviewer: MOCK_USERS[3],
    rating: 4,
    text: "Good tool overall. Would love to see more customization options in the next update.",
    createdAt: "2026-03-20",
  },
  {
    id: "r3",
    reviewer: MOCK_USERS[0],
    rating: 5,
    text: "Exactly what I needed. The overlay integration is seamless and doesn't impact performance at all.",
    createdAt: "2026-03-15",
  },
];

/* ───── Categories ───── */

export const CATEGORIES = [
  { id: "game-tools", name: "Game Tools", count: 142 },
  { id: "scripts", name: "Scripts", count: 89 },
  { id: "configs", name: "Configs", count: 67 },
  { id: "accounts", name: "Accounts", count: 34 },
  { id: "items", name: "Items", count: 215 },
  { id: "services", name: "Services", count: 28 },
];
