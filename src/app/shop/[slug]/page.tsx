import { notFound } from "next/navigation";
import { getCatalogProductBySlug, getPublishedProducts } from "@/lib/products";
import { ProductClientPage } from "./ProductClientPage";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const publishedProducts = await getPublishedProducts();
  const related = publishedProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return <ProductClientPage product={product} related={related} />;
}
