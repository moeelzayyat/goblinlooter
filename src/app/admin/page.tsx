import { requireAdminSession } from "@/lib/admin";
import { listAdminProducts } from "@/lib/admin-products";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  await requireAdminSession();
  const products = await listAdminProducts();

  return <AdminDashboard initialProducts={products} />;
}
