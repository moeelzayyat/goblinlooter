import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import {
  normalizeSiteSettingInput,
  revalidateSiteSettingPaths,
  type SiteSettingKey,
  upsertSiteSetting,
} from "@/lib/site-settings";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function isSiteSettingKey(value: string): value is SiteSettingKey {
  return ["home", "shop", "support", "footer", "legal"].includes(value);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { key } = await params;
    if (!isSiteSettingKey(key)) {
      return NextResponse.json({ error: "Setting key not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = normalizeSiteSettingInput(key, body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await upsertSiteSetting(key, parsed.data);
    revalidateSiteSettingPaths(key);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin] Update site settings failed:", error);
    return NextResponse.json(
      { error: "Failed to update site settings." },
      { status: 500 }
    );
  }
}
