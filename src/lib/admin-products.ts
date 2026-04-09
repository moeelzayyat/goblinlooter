import type { InventoryKey, Product as DbProduct } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  DeliveryMethod,
  ProductCategory,
  ProductStatus,
  RefundEligibility,
} from "@/types";

type AdminProductWithKeys = DbProduct & {
  inventoryKeys?: Pick<InventoryKey, "status">[];
};

export interface AdminProductRecord {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: ProductCategory;
  price: number;
  platform: string[];
  compatibilityNotes: string;
  regionRestrictions: string | null;
  deliveryMethod: DeliveryMethod;
  downloadUrl: string | null;
  deliveryTimeEstimate: string;
  refundEligibility: RefundEligibility;
  refundTerms: string;
  images: string[];
  featured: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  availableKeyCount: number;
  assignedKeyCount: number;
  revokedKeyCount: number;
}

const VALID_CATEGORIES: ProductCategory[] = ["game-keys", "tool-access", "configs"];
const VALID_DELIVERY_METHODS: DeliveryMethod[] = ["key", "download", "manual"];
const VALID_REFUND_ELIGIBILITY: RefundEligibility[] = [
  "eligible",
  "conditional",
  "non-refundable",
];
const VALID_STATUSES: ProductStatus[] = ["draft", "published", "disabled"];

function parseStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function serializeProduct(product: AdminProductWithKeys): AdminProductRecord {
  const keyCounts = (product.inventoryKeys || []).reduce(
    (totals, key) => {
      if (key.status === "available") totals.available += 1;
      if (key.status === "assigned") totals.assigned += 1;
      if (key.status === "revoked") totals.revoked += 1;
      return totals;
    },
    { available: 0, assigned: 0, revoked: 0 }
  );

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    category: product.category as ProductCategory,
    price: Number(product.price),
    platform: product.platform,
    compatibilityNotes: product.compatibilityNotes,
    regionRestrictions: product.regionRestrictions,
    deliveryMethod: product.deliveryMethod as DeliveryMethod,
    downloadUrl: product.downloadUrl,
    deliveryTimeEstimate: product.deliveryTimeEstimate,
    refundEligibility: product.refundEligibility as RefundEligibility,
    refundTerms: product.refundTerms,
    images: product.images,
    featured: product.featured,
    status: product.status as ProductStatus,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    availableKeyCount: keyCounts.available,
    assignedKeyCount: keyCounts.assigned,
    revokedKeyCount: keyCounts.revoked,
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeProductInput(input: Record<string, unknown>) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const slugSource =
    typeof input.slug === "string" && input.slug.trim() ? input.slug : title;
  const slug = slugify(slugSource);
  const shortDescription =
    typeof input.shortDescription === "string"
      ? input.shortDescription.trim()
      : "";
  const fullDescription =
    typeof input.fullDescription === "string"
      ? input.fullDescription.trim()
      : "";
  const compatibilityNotes =
    typeof input.compatibilityNotes === "string"
      ? input.compatibilityNotes.trim()
      : "";
  const deliveryTimeEstimate =
    typeof input.deliveryTimeEstimate === "string"
      ? input.deliveryTimeEstimate.trim()
      : "";
  const refundTerms =
    typeof input.refundTerms === "string" ? input.refundTerms.trim() : "";
  const regionRestrictions =
    typeof input.regionRestrictions === "string" &&
    input.regionRestrictions.trim()
      ? input.regionRestrictions.trim()
      : null;
  const downloadUrl =
    typeof input.downloadUrl === "string" && input.downloadUrl.trim()
      ? input.downloadUrl.trim()
      : null;
  const category = input.category as ProductCategory;
  const deliveryMethod = input.deliveryMethod as DeliveryMethod;
  const refundEligibility = input.refundEligibility as RefundEligibility;
  const status = input.status as ProductStatus;
  const price = Number(input.price);
  const platform = parseStringList(input.platform);
  const images = parseStringList(input.images);

  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "Slug is required." };
  if (!shortDescription) return { error: "Short description is required." };
  if (!fullDescription) return { error: "Full description is required." };
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price must be a valid non-negative number." };
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return { error: "Category is invalid." };
  }
  if (!VALID_DELIVERY_METHODS.includes(deliveryMethod)) {
    return { error: "Delivery method is invalid." };
  }
  if (!VALID_REFUND_ELIGIBILITY.includes(refundEligibility)) {
    return { error: "Refund eligibility is invalid." };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Status is invalid." };
  }
  if (platform.length === 0) {
    return { error: "At least one platform is required." };
  }
  if (!compatibilityNotes) {
    return { error: "Compatibility notes are required." };
  }
  if (!deliveryTimeEstimate) {
    return { error: "Delivery time estimate is required." };
  }
  if (!refundTerms) {
    return { error: "Refund terms are required." };
  }

  return {
    data: {
      title,
      slug,
      shortDescription,
      fullDescription,
      category,
      price,
      platform,
      compatibilityNotes,
      regionRestrictions,
      deliveryMethod,
      downloadUrl,
      deliveryTimeEstimate,
      refundEligibility,
      refundTerms,
      images,
      featured: Boolean(input.featured),
      status,
    },
  };
}

export function normalizeKeyInput(input: unknown) {
  const keys = parseStringList(input);
  const deduped = [...new Set(keys)];

  if (deduped.length === 0) {
    return { error: "Add at least one key." };
  }

  return { keys: deduped };
}

export async function listAdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      inventoryKeys: {
        select: { status: true },
      },
    },
  });

  return products.map(serializeProduct);
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      inventoryKeys: {
        select: { status: true },
      },
    },
  });

  return product ? serializeProduct(product) : null;
}
