import type { Product } from "@/types";

/* ───── Products (Storefront — we are the seller) ───── */

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "ArcWay — Regular",
    slug: "arcway-regular",
    shortDescription:
      "The ultimate Arc Raiders helper and money maker — fast, undetected, and regularly updated.",
    fullDescription:
      "ArcWay is the premier helper and money maker tool built exclusively for Arc Raiders. Leverage advanced techniques to maximize your in-game earnings safely and efficiently. Features include smart automation, anti-detection bypass, auto-updates with every game patch, and a clean overlay UI. Backed by a dedicated support team and active community.",
    price: 35,
    images: ["/arcway-dupe.png"],
    category: "tool-access",
    platform: ["Windows 10/11"],
    compatibilityNotes: "Requires Arc Raiders (latest patch). Windows 10 or 11 only. DirectX 12.",
    regionRestrictions: null,
    deliveryMethod: "key",
    deliveryTimeEstimate: "Instant delivery",
    refundEligibility: "conditional",
    refundTerms:
      "Refund available within 72 hours if the key has not been redeemed. No refunds after activation.",
    featured: true,
    status: "published",
    stockCount: 15,
    createdAt: "2026-03-20",
  },
  {
    id: "p2",
    title: "ArcWay — Refresh All IDs",
    slug: "arcway-refresh-ids",
    shortDescription:
      "Full ArcWay helper and money maker with complete ID refresh — start completely clean.",
    fullDescription:
      "ArcWay Refresh All IDs includes everything in the Regular package plus a complete identity refresh. All hardware and software IDs are regenerated, giving you a completely clean slate. Ideal for users who want maximum safety or need a fresh start. Includes priority support and same-day setup assistance.",
    price: 60,
    images: ["/arcway-dupe.png"],
    category: "tool-access",
    platform: ["Windows 10/11"],
    compatibilityNotes: "Requires Arc Raiders (latest patch). Windows 10 or 11 only. DirectX 12.",
    regionRestrictions: null,
    deliveryMethod: "key",
    deliveryTimeEstimate: "Instant delivery",
    refundEligibility: "conditional",
    refundTerms:
      "Refund available within 72 hours if the key has not been redeemed. No refunds after activation.",
    featured: true,
    status: "published",
    stockCount: 10,
    createdAt: "2026-03-20",
  },
];

/* ───── Categories ───── */

export const CATEGORIES = [
  { id: "tool-access" as const, name: "Game Tools", count: 2 },
];
