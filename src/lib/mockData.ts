import type { Product } from "@/types";

/* ───── Mock Products (Storefront — we are the seller) ───── */

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "AutoFarm Pro — Intelligent Resource Collector",
    slug: "autofarm-pro",
    shortDescription:
      "AI-powered farming tool with smart pathfinding and anti-detection.",
    fullDescription:
      "Advanced farming tool with AI-powered pathfinding, anti-detection measures, and customizable routes. Supports 15+ games. Includes lifetime updates and priority support.",
    price: 24.99,
    images: [],
    category: "tool-access",
    platform: ["Windows 10/11"],
    compatibilityNotes: "Requires DirectX 11+. Windows 10 or 11 only.",
    regionRestrictions: null,
    deliveryMethod: "key",
    deliveryTimeEstimate: "Typically within seconds",
    refundEligibility: "conditional",
    refundTerms:
      "Refund available within 72 hours if the key has not been redeemed. No refunds after activation.",
    featured: true,
    status: "published",
    stockCount: 48,
    createdAt: "2025-11-20",
  },
  {
    id: "p2",
    title: "LootRadar — Real-Time Drop Tracker",
    slug: "lootradar",
    shortDescription:
      "Track rare item drops in real time with overlay support.",
    fullDescription:
      "Track rare item drops in real time with overlay support. Configurable alerts for high-value spawns. Works with most popular MMOs and RPGs.",
    price: 14.99,
    images: [],
    category: "tool-access",
    platform: ["Windows 10/11"],
    compatibilityNotes: "Overlay requires DirectX 11. Admin rights needed.",
    regionRestrictions: null,
    deliveryMethod: "key",
    deliveryTimeEstimate: "Typically within seconds",
    refundEligibility: "conditional",
    refundTerms:
      "Refund available within 72 hours if the key has not been redeemed.",
    featured: true,
    status: "published",
    stockCount: 63,
    createdAt: "2025-12-05",
  },
  {
    id: "p3",
    title: "ConfigPack Elite — Optimized Game Settings",
    slug: "configpack-elite",
    shortDescription:
      "Pre-tuned configurations for competitive FPS games.",
    fullDescription:
      "Pre-tuned configurations for competitive FPS games. Includes sensitivity calculators, crosshair presets, and video settings optimized for maximum FPS.",
    price: 9.99,
    images: [],
    category: "configs",
    platform: ["Windows", "macOS"],
    compatibilityNotes:
      "Compatible with CS2, Valorant, Apex Legends, and Overwatch 2.",
    regionRestrictions: null,
    deliveryMethod: "download",
    deliveryTimeEstimate: "Typically within seconds",
    refundEligibility: "non-refundable",
    refundTerms:
      "Config packs are non-refundable once downloaded. Preview descriptions carefully before purchasing.",
    featured: true,
    status: "published",
    stockCount: 999,
    createdAt: "2025-10-15",
  },
  {
    id: "p4",
    title: "MarketEdge — In-Game Price Analyzer",
    slug: "marketedge",
    shortDescription:
      "Real-time price tracking and trend analysis for in-game economies.",
    fullDescription:
      "Real-time price tracking and trend analysis for in-game marketplaces. Alerts, charts, and profit calculators. Supports WoW, FFXIV, EVE Online, and more.",
    price: 19.99,
    images: [],
    category: "tool-access",
    platform: ["Windows 10/11"],
    compatibilityNotes: "Requires .NET 8 runtime. Internet connection required.",
    regionRestrictions: null,
    deliveryMethod: "key",
    deliveryTimeEstimate: "Typically within seconds",
    refundEligibility: "conditional",
    refundTerms:
      "Refund available within 72 hours if the key has not been redeemed.",
    featured: true,
    status: "published",
    stockCount: 31,
    createdAt: "2026-01-08",
  },
  {
    id: "p5",
    title: "DungeonMapper — Instance Layout Tool",
    slug: "dungeonmapper",
    shortDescription:
      "Automatically maps dungeon layouts and marks key locations.",
    fullDescription:
      "Automatically maps dungeon layouts and marks key locations. Integrates with popular overlay tools. Supports 10+ games with regular updates.",
    price: 12.99,
    images: [],
    category: "tool-access",
    platform: ["Windows 10/11"],
    compatibilityNotes: "Requires overlay permissions. DirectX 11+.",
    regionRestrictions: null,
    deliveryMethod: "key",
    deliveryTimeEstimate: "Typically within seconds",
    refundEligibility: "conditional",
    refundTerms:
      "Refund available within 72 hours if the key has not been redeemed.",
    featured: false,
    status: "published",
    stockCount: 22,
    createdAt: "2026-02-14",
  },
  {
    id: "p6",
    title: "QuickMacro — Custom Keybind Pack",
    slug: "quickmacro",
    shortDescription:
      "Pre-built macro sequences with visual documentation.",
    fullDescription:
      "Pre-built macro sequences for RPG and MMO games. Includes visual documentation, installation guide, and support for major macro engines.",
    price: 7.99,
    images: [],
    category: "configs",
    platform: ["Windows", "macOS", "Linux"],
    compatibilityNotes:
      "Supports AutoHotkey, Logitech G Hub, and Razer Synapse formats.",
    regionRestrictions: null,
    deliveryMethod: "download",
    deliveryTimeEstimate: "Typically within seconds",
    refundEligibility: "non-refundable",
    refundTerms:
      "Config/macro packs are non-refundable once downloaded.",
    featured: false,
    status: "published",
    stockCount: 999,
    createdAt: "2026-03-01",
  },
];

/* ───── Categories (Phase 1: 3 only) ───── */

export const CATEGORIES = [
  { id: "game-keys" as const, name: "Game Keys", count: 24 },
  { id: "tool-access" as const, name: "Tool Access", count: 18 },
  { id: "configs" as const, name: "Configs", count: 12 },
];
