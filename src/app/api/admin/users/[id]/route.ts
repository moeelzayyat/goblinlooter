import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import {
  getAdminCustomerById,
  normalizeAdminCustomerUpdate,
} from "@/lib/admin-dashboard";
import { prisma } from "@/lib/prisma";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = normalizeAdminCustomerUpdate(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: parsed.data,
    });

    const customer = await getAdminCustomerById(id);

    revalidatePath("/admin");

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("[Admin] Update user failed:", error);
    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}
