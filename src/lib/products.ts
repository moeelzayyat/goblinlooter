import { Prisma, type Product as DbProduct, type InventoryKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import type {
  Product,
  ProductFeatureGroup,
  ProductSetupGuide,
  PurchaseOption,
} from "@/types";

type ProductWithKeys = DbProduct & {
  inventoryKeys?: Pick<InventoryKey, "status">[];
  productVideo?: {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

const ARCWAY_SERVICES_COPY = {
  title: "ArcWay Services",
  shortDescription:
    "ArcWay gaming tools with guided setup, clean overlays, and fast digital delivery.",
  fullDescription:
    "ArcWay Services includes gaming utility access, setup resources, and priority assistance for Arc Raiders players. Built for straightforward configuration, clear guidance, and smooth support from purchase through activation.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePurchaseOptions(value: unknown): PurchaseOption[] {
  if (!Array.isArray(value)) return [];

  const options: PurchaseOption[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) continue;

      const id = typeof entry.id === "string" ? entry.id.trim() : "";
      const label = typeof entry.label === "string" ? entry.label.trim() : "";
      const price = Number(entry.price);
      const description =
        typeof entry.description === "string" && entry.description.trim()
          ? entry.description.trim()
          : null;

      if (!id || !label || !Number.isFinite(price) || price < 0.5) {
        continue;
      }

    options.push({ id, label, price, description });
  }

  return options;
}

function normalizeFeatureGroups(value: unknown): ProductFeatureGroup[] {
  if (!Array.isArray(value)) return [];

  const groups: ProductFeatureGroup[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) continue;

    const title = typeof entry.title === "string" ? entry.title.trim() : "";
    const idSource =
      typeof entry.id === "string" && entry.id.trim() ? entry.id : title;
    const id = idSource
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const description =
      typeof entry.description === "string" && entry.description.trim()
        ? entry.description.trim()
        : null;
    const items = Array.isArray(entry.items)
      ? entry.items
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
      : [];

    if (!id || !title || items.length === 0) continue;
    groups.push({ id, title, description, items });
  }

  return groups;
}

function normalizeSetupGuide(value: unknown): ProductSetupGuide | null {
  if (!isRecord(value)) return null;

  const videoUrl =
    typeof value.videoUrl === "string" && value.videoUrl.trim()
      ? value.videoUrl.trim()
      : null;
  const steps = Array.isArray(value.steps)
    ? value.steps
        .map((step) => (typeof step === "string" ? step.trim() : ""))
        .filter(Boolean)
    : [];
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
  const notes =
    typeof value.notes === "string" && value.notes.trim()
      ? value.notes.trim()
      : null;

  if (!videoUrl && steps.length === 0 && fixes.length === 0 && !notes) return null;

  return { videoUrl, steps, fixes, notes };
}

function toPurchaseOptionsJson(
  options: PurchaseOption[] | undefined
): Prisma.InputJsonValue | undefined {
  if (!options || options.length === 0) return undefined;

  return options.map((option) => ({
    id: option.id,
    label: option.label,
    price: option.price,
    description: option.description || null,
  }));
}

function toFeatureGroupsJson(
  groups: ProductFeatureGroup[] | undefined
): Prisma.InputJsonValue | undefined {
  if (!groups || groups.length === 0) return undefined;

  return groups.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description || null,
    items: group.items,
  }));
}

function normalizePublicProductCopy(product: Product): Product {
  if (product.slug !== "arcway-refresh-ids") {
    return product;
  }

  return {
    ...product,
    ...ARCWAY_SERVICES_COPY,
    images: product.images.length > 0 ? product.images : ["/arcway-dupe.png"],
  };
}

function toPublicProduct(product: ProductWithKeys): Product {
  const availableKeys =
    product.inventoryKeys?.filter((key) => key.status === "available").length ??
    undefined;

  return normalizePublicProductCopy({
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
    featureGroups: normalizeFeatureGroups(product.featureGroups),
    category: product.category as Product["category"],
    price: Number(product.price),
    purchaseOptions: normalizePurchaseOptions(product.purchaseOptions),
    platform: product.platform,
    compatibilityNotes: product.compatibilityNotes,
    regionRestrictions: product.regionRestrictions,
    deliveryMethod: product.deliveryMethod as Product["deliveryMethod"],
    downloadUrl: product.downloadUrl,
    deliveryTimeEstimate: product.deliveryTimeEstimate,
    setupGuide: normalizeSetupGuide(product.setupGuide),
    availabilityLabel: product.availabilityLabel,
    availabilityTone: product.availabilityTone as Product["availabilityTone"],
    refundEligibility: product.refundEligibility as Product["refundEligibility"],
    refundTerms: product.refundTerms,
    images: product.images,
    featured: product.featured,
    status: product.status as Product["status"],
    stockCount:
      product.deliveryMethod === "key" ? availableKeys : undefined,
    createdAt: product.createdAt.toISOString(),
  });
}

function normalizeFallbackProduct(product: Product): Product {
  return normalizePublicProductCopy({
    ...product,
    downloadUrl: product.downloadUrl || null,
  });
}

export function buildCategoryOptions(products: Product[]) {
  const counts = new Map<string, number>();

  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) || 0) + 1);
  }

  return [...counts.entries()].map(([id, count]) => ({
    id: id as Product["category"],
    name: id.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    count,
  }));
}

export async function getPublishedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: "published" },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
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
          select: { status: true },
        },
      },
    });

    if (products.length > 0) {
      return products.map(toPublicProduct);
    }

    const totalProducts = await prisma.product.count();
    if (totalProducts > 0) {
      return [];
    }
  } catch (error) {
    console.warn("[Catalog] Falling back to mock products:", error);
  }

  return MOCK_PRODUCTS
    .filter((product) => product.status === "published")
    .map(normalizeFallbackProduct);
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
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
          select: { status: true },
        },
      },
    });

    if (product) {
      return product.status === "published" ? toPublicProduct(product) : null;
    }

    const totalProducts = await prisma.product.count();
    if (totalProducts > 0) {
      return null;
    }
  } catch (error) {
    console.warn(`[Catalog] Could not load product ${slug}:`, error);
  }

  const fallback = MOCK_PRODUCTS.find(
    (product) => product.slug === slug && product.status === "published"
  );
  return fallback ? normalizeFallbackProduct(fallback) : null;
}

export async function getAdminProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
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
        select: { status: true },
      },
    },
  });

  return products.map(toPublicProduct);
}

export async function ensureDatabaseProduct(slug: string) {
  const existing = await prisma.product.findUnique({
    where: { slug },
  });

  if (existing) return existing;

  const fallback = MOCK_PRODUCTS.find((product) => product.slug === slug);
  if (!fallback) return null;

  return prisma.product.create({
    data: {
      title: fallback.title,
      slug: fallback.slug,
      shortDescription: fallback.shortDescription,
      fullDescription: fallback.fullDescription,
      videoUrl: fallback.videoUrl || null,
      disclaimer: fallback.disclaimer || null,
      featureGroups: toFeatureGroupsJson(fallback.featureGroups),
      category: fallback.category,
      price: fallback.price,
      purchaseOptions: toPurchaseOptionsJson(fallback.purchaseOptions),
      platform: fallback.platform,
      compatibilityNotes: fallback.compatibilityNotes,
      regionRestrictions: fallback.regionRestrictions,
      deliveryMethod: fallback.deliveryMethod,
      downloadUrl: fallback.downloadUrl || null,
      deliveryTimeEstimate: fallback.deliveryTimeEstimate,
      availabilityLabel: fallback.availabilityLabel || null,
      availabilityTone: fallback.availabilityTone || null,
      refundEligibility: fallback.refundEligibility,
      refundTerms: fallback.refundTerms,
      images: fallback.images,
      featured: fallback.featured,
      status: fallback.status,
    },
  });
}
