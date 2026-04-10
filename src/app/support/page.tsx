import { getSiteSettings } from "@/lib/site-settings";
import { SupportClientPage } from "./SupportClientPage";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const settings = (await getSiteSettings()).support;

  return <SupportClientPage initialSettings={settings} />;
}
