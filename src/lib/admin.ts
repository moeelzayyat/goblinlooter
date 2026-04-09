import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const ADMIN_PANEL_COOKIE_NAME = "gl_admin_gate";

type AdminPanelConfig = {
  username: string;
  password: string;
  authSecret: string;
};

async function resolveAdminSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  if (session.user.role === "admin") {
    return session;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    return null;
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: "admin" as const,
    },
  };
}

function getAdminPanelConfig(): AdminPanelConfig | null {
  const username = process.env.ADMIN_PANEL_USERNAME?.trim();
  const password = process.env.ADMIN_PANEL_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (!username || !password || !authSecret) {
    return null;
  }

  return {
    username,
    password,
    authSecret,
  };
}

function createDigest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeStringMatch(input: string, expected: string) {
  return timingSafeEqual(createDigest(input), createDigest(expected));
}

function createAdminPanelCookieValue(config: AdminPanelConfig) {
  return createHmac("sha256", `${config.authSecret}:${config.password}`)
    .update(config.username)
    .digest("hex");
}

export function isAdminPanelConfigured() {
  return getAdminPanelConfig() !== null;
}

export function verifyAdminPanelCredentials(
  username: string,
  password: string
) {
  const config = getAdminPanelConfig();

  if (!config) {
    return false;
  }

  return (
    safeStringMatch(username.trim(), config.username) &&
    safeStringMatch(password, config.password)
  );
}

export function getAdminPanelCookieValue() {
  const config = getAdminPanelConfig();
  return config ? createAdminPanelCookieValue(config) : null;
}

export function getAdminPanelCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export async function hasAdminPanelAccess() {
  const expectedValue = getAdminPanelCookieValue();
  if (!expectedValue) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_PANEL_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return false;
  }

  return safeStringMatch(cookieValue, expectedValue);
}

export async function getAdminRoleSession() {
  return resolveAdminSession();
}

export async function requireAdminRoleSession() {
  const session = await getAdminRoleSession();

  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return session;
}

export async function getAdminApiSession() {
  const session = await resolveAdminSession();
  if (!session) {
    return null;
  }

  const unlocked = await hasAdminPanelAccess();
  return unlocked ? session : null;
}
