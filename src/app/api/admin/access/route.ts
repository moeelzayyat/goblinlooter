import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PANEL_COOKIE_NAME,
  getAdminPanelCookieOptions,
  getAdminPanelCookieValue,
  getAdminRoleSession,
  isAdminPanelConfigured,
  verifyAdminPanelCredentials,
} from "@/lib/admin";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const session = await getAdminRoleSession();
  if (!session) return forbidden();

  if (!isAdminPanelConfigured()) {
    return NextResponse.json(
      { error: "Admin panel credentials are not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Admin username and password are required." },
        { status: 400 }
      );
    }

    const valid = verifyAdminPanelCredentials(username, password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid admin panel credentials." },
        { status: 401 }
      );
    }

    const cookieValue = getAdminPanelCookieValue();
    if (!cookieValue) {
      return NextResponse.json(
        { error: "Admin panel credentials are not configured." },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(
      ADMIN_PANEL_COOKIE_NAME,
      cookieValue,
      getAdminPanelCookieOptions()
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Admin] Unlock failed:", error);
    return NextResponse.json(
      { error: "Unable to unlock the admin panel." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getAdminRoleSession();
  if (!session) return forbidden();

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_PANEL_COOKIE_NAME, "", {
    ...getAdminPanelCookieOptions(),
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
