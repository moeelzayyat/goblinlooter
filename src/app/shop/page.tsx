import { buildCategoryOptions, getPublishedProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import { ShopClientPage } from "./ShopClientPage";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const settings = (await getSiteSettings()).shop;
  const products = await getPublishedProducts();
  const categoryOptions = buildCategoryOptions(products);
  const { category } = await searchParams;

  return (
    <ShopClientPage
      products={products}
      categoryOptions={categoryOptions}
      initialCategory={typeof category === "string" ? category : ""}
      settings={settings}
    />
  );
}
