import type { Product as DbProduct, InventoryKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import type { Product } from "@/types";

type ProductWithKeys = DbProduct & {
  inventoryKeys?: Pick<InventoryKey, "status">[];
};

function toPublicProduct(product: ProductWithKeys): Product {
  const availableKeys =
    product.inventoryKeys?.filter((key) => key.status === "available").length ??
    undefined;

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    category: product.category as Product["category"],
    price: Number(product.price),
    platform: product.platform,
    compatibilityNotes: product.compatibilityNotes,
    regionRestrictions: product.regionRestrictions,
    deliveryMethod: product.deliveryMethod as Product["deliveryMethod"],
    downloadUrl: product.downloadUrl,
    deliveryTimeEstimate: product.deliveryTimeEstimate,
    refundEligibility: product.refundEligibility as Product["refundEligibility"],
    refundTerms: product.refundTerms,
    images: product.images,
    featured: product.featured,
    status: product.status as Product["status"],
    stockCount:
      product.deliveryMethod === "key" ? availableKeys : undefined,
    createdAt: product.createdAt.toISOString(),
  };
}

function normalizeFallbackProduct(product: Product): Product {
  return {
    ...product,
    downloadUrl: product.downloadUrl || null,
  };
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
      category: fallback.category,
      price: fallback.price,
      platform: fallback.platform,
      compatibilityNotes: fallback.compatibilityNotes,
      regionRestrictions: fallback.regionRestrictions,
      deliveryMethod: fallback.deliveryMethod,
      downloadUrl: fallback.downloadUrl || null,
      deliveryTimeEstimate: fallback.deliveryTimeEstimate,
      refundEligibility: fallback.refundEligibility,
      refundTerms: fallback.refundTerms,
      images: fallback.images,
      featured: fallback.featured,
      status: fallback.status,
    },
  });
}
