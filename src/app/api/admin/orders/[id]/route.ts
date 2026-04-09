import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import {
  getAdminOrderById,
  normalizeAdminOrderStatus,
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
    const existing = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        deliveredAt: true,
        items: {
          select: {
            product: {
              select: {
                slug: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = normalizeAdminOrderStatus(body.status);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const deliveredAt =
      parsed.status === "delivered"
        ? existing.deliveredAt ?? new Date()
        : parsed.status === "pending" ||
            parsed.status === "paid" ||
            parsed.status === "review" ||
            parsed.status === "cancelled"
          ? null
          : existing.deliveredAt;

    await prisma.order.update({
      where: { id },
      data: {
        status: parsed.status,
        deliveredAt,
      },
    });

    const order = await getAdminOrderById(id);

    revalidatePath("/admin");
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);

    const slug = existing.items[0]?.product?.slug;
    if (slug) {
      revalidatePath(`/shop/${slug}`);
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[Admin] Update order failed:", error);
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 }
    );
  }
}
