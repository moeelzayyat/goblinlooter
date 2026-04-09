import {
  hasAdminPanelAccess,
  isAdminPanelConfigured,
  requireAdminRoleSession,
} from "@/lib/admin";
import { listAdminProducts } from "@/lib/admin-products";
import { AdminAccessGate } from "./AdminAccessGate";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  await requireAdminRoleSession();

  const unlocked = await hasAdminPanelAccess();
  if (!unlocked) {
    return <AdminAccessGate configured={isAdminPanelConfigured()} />;
  }

  const products = await listAdminProducts();

  return <AdminDashboard initialProducts={products} />;
}
