import { buildCategoryOptions, getPublishedProducts } from "@/lib/products";
import { ShopClientPage } from "./ShopClientPage";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const products = await getPublishedProducts();
  const categoryOptions = buildCategoryOptions(products);
  const { category } = await searchParams;

  return (
    <ShopClientPage
      products={products}
      categoryOptions={categoryOptions}
      initialCategory={typeof category === "string" ? category : ""}
    />
  );
}
