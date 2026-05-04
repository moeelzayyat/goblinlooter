import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      productTitle:
        order.items[0]?.product?.title || "Unknown Product",
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString() || null,
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
