import { Prisma, type InventoryKey, type Product as DbProduct } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  DeliveryMethod,
  ProductCategory,
  ProductAvailabilityTone,
  ProductDownloadFile,
  ProductFeatureGroup,
  ProductSetupFix,
  ProductSetupGuide,
  ProductVideoFile,
  PurchaseOption,
  ProductStatus,
  RefundEligibility,
} from "@/types";

export type { ProductSetupGuide };

type AdminProductWithKeys = DbProduct & {
  inventoryKeys?: Pick<
    InventoryKey,
    "id" | "keyValue" | "status" | "orderId" | "assignedAt" | "createdAt"
  >[];
  productFile?: {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  productVideo?: {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

export interface AdminProductRecord {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  videoUrl: string | null;
  productVideo: ProductVideoFile | null;
  disclaimer: string | null;
  featureGroups: ProductFeatureGroup[];
  category: ProductCategory;
  price: number;
  purchaseOptions: PurchaseOption[];
  productFile: ProductDownloadFile | null;
  platform: string[];
  compatibilityNotes: string;
  regionRestrictions: string | null;
  deliveryMethod: DeliveryMethod;
  downloadUrl: string | null;
  deliveryTimeEstimate: string;
  thankYouMessage: string | null;
  setupGuide: ProductSetupGuide | null;
  availabilityLabel: string | null;
  availabilityTone: ProductAvailabilityTone | null;
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
  inventoryKeys: AdminInventoryKeyRecord[];
}

export interface AdminInventoryKeyRecord {
  id: string;
  keyValue: string;
  status: "available" | "assigned" | "revoked";
  orderId: string | null;
  assignedAt: string | null;
  createdAt: string;
}

const VALID_CATEGORIES: ProductCategory[] = ["game-keys", "tool-access", "configs"];
const VALID_DELIVERY_METHODS: DeliveryMethod[] = ["key", "download", "manual"];
const VALID_REFUND_ELIGIBILITY: RefundEligibility[] = [
  "eligible",
  "conditional",
  "non-refundable",
];
const VALID_STATUSES: ProductStatus[] = ["draft", "published", "disabled"];
const VALID_AVAILABILITY_TONES: ProductAvailabilityTone[] = [
  "green",
  "orange",
  "red",
  "blue",
  "gray",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function parsePurchaseOptions(value: unknown) {
  if (!Array.isArray(value)) return { options: [] as PurchaseOption[] };

  const options: PurchaseOption[] = [];
  const seenIds = new Set<string>();

  for (const [index, entry] of value.entries()) {
    if (!isRecord(entry)) {
      return { error: "Purchase options must be valid option rows." };
    }

    const label = typeof entry.label === "string" ? entry.label.trim() : "";
    const idSource =
      typeof entry.id === "string" && entry.id.trim() ? entry.id : label;
    const id = slugify(idSource);
    const description =
      typeof entry.description === "string" && entry.description.trim()
        ? entry.description.trim()
        : null;
    const providerKeyUrl =
      typeof entry.providerKeyUrl === "string" && entry.providerKeyUrl.trim()
        ? entry.providerKeyUrl.trim()
        : null;
    const price = Number(entry.price);

    if (!label && !idSource && !Number.isFinite(price)) continue;
    if (!label) {
      return { error: `Purchase option ${index + 1} needs a label.` };
    }
    if (!id) {
      return { error: `Purchase option ${label} needs a valid ID.` };
    }
    if (seenIds.has(id)) {
      return { error: `Purchase option IDs must be unique. "${id}" is repeated.` };
    }
    if (!Number.isFinite(price) || price < 0.5) {
      return { error: `Purchase option "${label}" must be at least $0.50.` };
    }

    seenIds.add(id);
    options.push({ id, label, price, description, providerKeyUrl });
  }

  return { options };
}

function parseFeatureGroups(value: unknown) {
  if (!Array.isArray(value)) return { groups: [] as ProductFeatureGroup[] };

  const groups: ProductFeatureGroup[] = [];
  const seenIds = new Set<string>();

  for (const [index, entry] of value.entries()) {
    if (!isRecord(entry)) {
      return { error: "Feature groups must be valid rows." };
    }

    const title = typeof entry.title === "string" ? entry.title.trim() : "";
    const idSource =
      typeof entry.id === "string" && entry.id.trim() ? entry.id : title;
    const id = slugify(idSource);
    const description =
      typeof entry.description === "string" && entry.description.trim()
        ? entry.description.trim()
        : null;
    const items = parseStringList(entry.items);

    if (!title && !description && items.length === 0) continue;
    if (!title) {
      return { error: `Feature group ${index + 1} needs a title.` };
    }
    if (!id) {
      return { error: `Feature group ${title} needs a valid ID.` };
    }
    if (seenIds.has(id)) {
      return { error: `Feature group IDs must be unique. "${id}" is repeated.` };
    }
    if (items.length === 0) {
      return { error: `Feature group "${title}" needs at least one feature.` };
    }

    seenIds.add(id);
    groups.push({ id, title, description, items });
  }

  return { groups };
}

function serializeFeatureGroups(value: unknown): ProductFeatureGroup[] {
  const parsed = parseFeatureGroups(value);
  if ("error" in parsed) return [];
  return parsed.groups;
}

function toFeatureGroupsJson(groups: ProductFeatureGroup[]): Prisma.InputJsonValue {
  return groups.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description || null,
    items: group.items,
  }));
}

function parseSetupFixes(value: unknown) {
  const lines = Array.isArray(value)
    ? value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    : typeof value === "string"
      ? value
          .split(/\r?\n/)
          .map((entry) => entry.trim())
          .filter((entry) => entry && !entry.startsWith("```"))
      : [];

  const fixes: ProductSetupFix[] = [];
  let pendingError = "";

  for (const [index, line] of lines.entries()) {
    if (line.includes("=>")) {
      const [error, ...fixParts] = line.split("=>");
      const fix = {
        error: error?.replace(/^ERROR:\s*/i, "").trim() || "",
        fix: fixParts.join("=>").replace(/^(FIX|NOTICE):\s*/i, "").trim(),
      };

      if (!fix.error || !fix.fix) {
        return {
          error: `Setup guide fix ${index + 1} must use "Error => Fix" format.`,
        };
      }

      fixes.push(fix);
      pendingError = "";
      continue;
    }

    const errorMatch = line.match(/^ERROR:\s*(.+)$/i);
    if (errorMatch) {
      if (pendingError) {
        return {
          error: `Setup guide fix ${index} is missing a matching "FIX:" line.`,
        };
      }
      pendingError = errorMatch[1].trim();
      continue;
    }

    const fixMatch = line.match(/^(FIX|NOTICE):\s*(.+)$/i);
    if (fixMatch && pendingError) {
      fixes.push({ error: pendingError, fix: fixMatch[2].trim() });
      pendingError = "";
      continue;
    }

    return {
      error: `Setup guide fix ${index + 1} must use "Error => Fix" or "ERROR:" followed by "FIX:" format.`,
    };
  }

  if (pendingError) {
    return {
      error: `Setup guide fix ${lines.length} is missing a matching "FIX:" line.`,
    }
  }

  return { fixes };
}

function parseSetupGuide(input: Record<string, unknown>) {
  const videoUrl =
    typeof input.setupGuideVideoUrl === "string" && input.setupGuideVideoUrl.trim()
      ? input.setupGuideVideoUrl.trim()
      : null;
  const steps = parseStringList(input.setupGuideSteps);
  const fixes = parseSetupFixes(input.setupGuideFixes);
  const notes =
    typeof input.setupGuideNotes === "string" && input.setupGuideNotes.trim()
      ? input.setupGuideNotes.trim()
      : null;

  if ("error" in fixes) return { error: fixes.error };

  if (!videoUrl && steps.length === 0 && fixes.fixes.length === 0 && !notes) {
    return { guide: null };
  }

  return {
    guide: {
      videoUrl,
      steps,
      fixes: fixes.fixes,
      notes,
    } satisfies ProductSetupGuide,
  };
}

function serializeSetupGuide(value: unknown): ProductSetupGuide | null {
  if (!isRecord(value)) return null;

  const steps = parseStringList(value.steps);
  const fixes = Array.isArray(value.fixes)
    ? value.fixes
        .map((entry) => {
          if (!isRecord(entry)) return null;
          const error = typeof entry.error === "string" ? entry.error.trim() : "";
          const fix = typeof entry.fix === "string" ? entry.fix.trim() : "";
          return error && fix ? { error, fix } : null;
        })
        .filter((entry): entry is { error: string; fix: string } => Boolean(entry))
    : [];
  const videoUrl =
    typeof value.videoUrl === "string" && value.videoUrl.trim()
      ? value.videoUrl.trim()
      : null;
  const notes =
    typeof value.notes === "string" && value.notes.trim()
      ? value.notes.trim()
      : null;

  if (!videoUrl && steps.length === 0 && fixes.length === 0 && !notes) return null;

  return { videoUrl, steps, fixes, notes };
}

function toSetupGuideJson(guide: ProductSetupGuide): Prisma.InputJsonValue {
  return {
    videoUrl: guide.videoUrl || null,
    steps: guide.steps,
    fixes: guide.fixes.map((fix) => ({ error: fix.error, fix: fix.fix })),
    notes: guide.notes || null,
  };
}

function serializePurchaseOptions(value: unknown): PurchaseOption[] {
  const parsed = parsePurchaseOptions(value);
  if ("error" in parsed) return [];
  return parsed.options;
}

function toPurchaseOptionsJson(options: PurchaseOption[]): Prisma.InputJsonValue {
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    price: option.price,
    description: option.description || null,
    providerKeyUrl: option.providerKeyUrl || null,
  }));
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
  const inventoryKeys = (product.inventoryKeys || [])
    .map((key) => ({
      id: key.id,
      keyValue: key.keyValue,
      status: key.status as AdminInventoryKeyRecord["status"],
      orderId: key.orderId,
      assignedAt: key.assignedAt?.toISOString() || null,
      createdAt: key.createdAt.toISOString(),
    }))
    .sort((a, b) => {
      const rank = {
        available: 0,
        revoked: 1,
        assigned: 2,
      } as const;

      const statusDiff = rank[a.status] - rank[b.status];
      if (statusDiff !== 0) return statusDiff;

      return b.createdAt.localeCompare(a.createdAt);
    });

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    videoUrl: product.videoUrl,
    productVideo: product.productVideo
      ? {
          id: product.productVideo.id,
          fileName: product.productVideo.fileName,
          contentType: product.productVideo.contentType,
          sizeBytes: product.productVideo.sizeBytes,
          videoUrl: `/api/products/${product.id}/video`,
          createdAt: product.productVideo.createdAt.toISOString(),
          updatedAt: product.productVideo.updatedAt.toISOString(),
        }
      : null,
    disclaimer: product.disclaimer,
    featureGroups: serializeFeatureGroups(product.featureGroups),
    category: product.category as ProductCategory,
    price: Number(product.price),
    purchaseOptions: serializePurchaseOptions(product.purchaseOptions),
    productFile: product.productFile
      ? {
          id: product.productFile.id,
          fileName: product.productFile.fileName,
          contentType: product.productFile.contentType,
          sizeBytes: product.productFile.sizeBytes,
          createdAt: product.productFile.createdAt.toISOString(),
          updatedAt: product.productFile.updatedAt.toISOString(),
        }
      : null,
    platform: product.platform,
    compatibilityNotes: product.compatibilityNotes,
    regionRestrictions: product.regionRestrictions,
    deliveryMethod: product.deliveryMethod as DeliveryMethod,
    downloadUrl: product.downloadUrl,
    deliveryTimeEstimate: product.deliveryTimeEstimate,
    thankYouMessage: product.thankYouMessage,
    setupGuide: serializeSetupGuide(product.setupGuide),
    availabilityLabel: product.availabilityLabel,
    availabilityTone: product.availabilityTone as ProductAvailabilityTone | null,
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
    inventoryKeys,
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
  const videoUrl =
    typeof input.videoUrl === "string" && input.videoUrl.trim()
      ? input.videoUrl.trim()
      : null;
  const disclaimer =
    typeof input.disclaimer === "string" && input.disclaimer.trim()
      ? input.disclaimer.trim()
      : null;
  const featureGroups = parseFeatureGroups(input.featureGroups);
  const compatibilityNotes =
    typeof input.compatibilityNotes === "string"
      ? input.compatibilityNotes.trim()
      : "";
  const deliveryTimeEstimate =
    typeof input.deliveryTimeEstimate === "string"
      ? input.deliveryTimeEstimate.trim()
      : "";
  const thankYouMessage =
    typeof input.thankYouMessage === "string" && input.thankYouMessage.trim()
      ? input.thankYouMessage.trim()
      : null;
  const setupGuide = parseSetupGuide(input);
  const availabilityLabel =
    typeof input.availabilityLabel === "string" && input.availabilityLabel.trim()
      ? input.availabilityLabel.trim().slice(0, 32)
      : null;
  const availabilityTone =
    typeof input.availabilityTone === "string" && input.availabilityTone.trim()
      ? (input.availabilityTone.trim() as ProductAvailabilityTone)
      : null;
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
  const purchaseOptions = parsePurchaseOptions(input.purchaseOptions);
  const platform = parseStringList(input.platform);
  const images = parseStringList(input.images);

  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "Slug is required." };
  if (!shortDescription) return { error: "Short description is required." };
  if (!fullDescription) return { error: "Full description is required." };
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price must be a valid non-negative number." };
  }
  if ("error" in purchaseOptions) {
    return { error: purchaseOptions.error };
  }
  if ("error" in featureGroups) {
    return { error: featureGroups.error };
  }
  if ("error" in setupGuide) {
    return { error: setupGuide.error };
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
  if (
    availabilityTone !== null &&
    !VALID_AVAILABILITY_TONES.includes(availabilityTone)
  ) {
    return { error: "Availability badge color is invalid." };
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
      videoUrl,
      disclaimer,
      featureGroups:
        featureGroups.groups.length > 0
          ? toFeatureGroupsJson(featureGroups.groups)
          : Prisma.JsonNull,
      category,
      price,
      purchaseOptions:
        purchaseOptions.options.length > 0
          ? toPurchaseOptionsJson(purchaseOptions.options)
          : Prisma.JsonNull,
      platform,
      compatibilityNotes,
      regionRestrictions,
      deliveryMethod,
      downloadUrl,
      deliveryTimeEstimate,
      thankYouMessage,
      setupGuide: setupGuide.guide
        ? toSetupGuideJson(setupGuide.guide)
        : Prisma.JsonNull,
      availabilityLabel,
      availabilityTone: availabilityLabel ? availabilityTone || "green" : null,
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
      productFile: {
        select: {
          id: true,
          fileName: true,
          contentType: true,
          sizeBytes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      productVideo: {
        select: {
          id: true,
          fileName: true,
          contentType: true,
          sizeBytes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      inventoryKeys: {
        select: {
          id: true,
          keyValue: true,
          status: true,
          orderId: true,
          assignedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return products.map(serializeProduct);
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      productFile: {
        select: {
          id: true,
          fileName: true,
          contentType: true,
          sizeBytes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      productVideo: {
        select: {
          id: true,
          fileName: true,
          contentType: true,
          sizeBytes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      inventoryKeys: {
        select: {
          id: true,
          keyValue: true,
          status: true,
          orderId: true,
          assignedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return product ? serializeProduct(product) : null;
}
