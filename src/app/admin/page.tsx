import {
  hasAdminPanelAccess,
  isAdminPanelConfigured,
  requireAdminRoleSession,
} from "@/lib/admin";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { AdminAccessGate } from "./AdminAccessGate";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  await requireAdminRoleSession();

  const unlocked = await hasAdminPanelAccess();
  if (!unlocked) {
    return <AdminAccessGate configured={isAdminPanelConfigured()} />;
  }

  const dashboardData = await getAdminDashboardData();

  return <AdminDashboard initialData={dashboardData} />;
}
