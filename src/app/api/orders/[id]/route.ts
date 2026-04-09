import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                slug: true,
                deliveryMethod: true,
                downloadUrl: true,
              },
            },
          },
        },
        key: {
          select: {
            id: true,
            status: true,
            keyValue: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only reveal key value if order is delivered
    const keyData = order.key
      ? {
          id: order.key.id,
          status: order.key.status,
          keyValue:
            order.status === "delivered" ? order.key.keyValue : undefined,
        }
      : null;

    const formatted = {
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      btcpayInvoiceId: order.btcpayInvoiceId,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.product?.title || "Unknown Product",
        productSlug: item.product?.slug || null,
        deliveryMethod: item.product?.deliveryMethod || null,
        downloadUrl:
          order.status === "delivered" ? item.product?.downloadUrl || null : null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
      key: keyData,
    };

    return NextResponse.json({ order: formatted });
  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
