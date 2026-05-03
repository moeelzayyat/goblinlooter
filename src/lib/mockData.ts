import type { Product } from "@/types";

/* Products (Storefront - we are the seller) */

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "ArcWay Services",
    slug: "arcway-refresh-ids",
    shortDescription:
      "ArcWay gaming tools with guided setup, clean overlays, and fast digital delivery.",
    fullDescription:
      "ArcWay Services includes gaming utility access, setup resources, and priority assistance for Arc Raiders players. Built for straightforward configuration, clear guidance, and smooth support from purchase through activation.",
    videoUrl: null,
    disclaimer:
      "Use this product only on systems and accounts where you understand and accept the applicable game, platform, and service terms. Confirm compatibility before purchase.",
    price: 60,
    images: ["/arcway-dupe.png"],
    category: "tool-access",
    platform: ["Windows 10/11"],
    compatibilityNotes:
      "Requires Arc Raiders (latest patch). Windows 10 or 11 only. DirectX 12.",
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

/* Categories */

export const CATEGORIES = [
  { id: "tool-access" as const, name: "Game Tools", count: 1 },
];
