import type { Product } from "@/types";

/* ───── Products (Storefront — we are the seller) ───── */

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "ArcWay Dupe",
    slug: "arcway-dupe",
    shortDescription:
      "Premium duplication tool for Arc Raiders — fast, undetected, and regularly updated.",
    fullDescription:
      "ArcWay Dupe is the premier duplication tool built exclusively for Arc Raiders. Leverage advanced memory techniques to duplicate in-game items safely and efficiently. Features include smart cooldown management, anti-detection bypass, auto-updates with every game patch, and a clean overlay UI. Backed by a dedicated support team and active community.",
    price: 24.99,
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
];

/* ───── Categories ───── */

export const CATEGORIES = [
  { id: "tool-access" as const, name: "Game Tools", count: 1 },
];
