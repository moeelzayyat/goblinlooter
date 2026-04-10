import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, type SiteSettingKey } from "@/lib/site-settings";

const KEYS: SiteSettingKey[] = ["home", "shop", "support", "footer", "legal"];

export async function GET(req: NextRequest) {
  try {
    const settings = await getSiteSettings();
    const requestedKeys = req.nextUrl.searchParams
      .get("keys")
      ?.split(",")
      .map((value) => value.trim())
      .filter((value): value is SiteSettingKey =>
        KEYS.includes(value as SiteSettingKey)
      );

    if (!requestedKeys || requestedKeys.length === 0) {
      return NextResponse.json({ settings });
    }

    const partialSettings = Object.fromEntries(
      requestedKeys.map((key) => [key, settings[key]])
    );

    return NextResponse.json({ settings: partialSettings });
  } catch (error) {
    console.error("[Site] Load site settings failed:", error);
    return NextResponse.json(
      { error: "Failed to load site settings." },
      { status: 500 }
    );
  }
}
