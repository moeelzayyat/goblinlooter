import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function requireAdminSession() {
  const session = await resolveAdminSession();

  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return session;
}

export async function getAdminApiSession() {
  return resolveAdminSession();
}
