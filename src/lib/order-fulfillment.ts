import { prisma } from "@/lib/prisma";

async function assignKey(orderId: string, productId: string) {
  const existingKey = await prisma.inventoryKey.findFirst({
    where: { orderId, productId },
  });

  if (existingKey) {
    return existingKey;
  }

  const key = await prisma.inventoryKey.findFirst({
    where: { productId, status: "available" },
    orderBy: { createdAt: "asc" },
  });

  if (!key) {
    console.error(
      `[Fulfillment] No available keys for product ${productId}, order ${orderId}`
    );
    await prisma.deliveryAuditLog.create({
      data: {
        orderId,
        action: "delivery_failed",
        metadata: { reason: "no_keys_available", productId },
        performedBy: "system",
      },
    });
    return null;
  }

  const assigned = await prisma.inventoryKey.update({
    where: { id: key.id },
    data: {
      status: "assigned",
      orderId,
      assignedAt: new Date(),
    },
  });

  await prisma.deliveryAuditLog.create({
    data: {
      orderId,
      keyId: assigned.id,
      action: "key_assigned",
      metadata: { productId },
      performedBy: "system",
    },
  });

  console.log(`[Fulfillment] Key ${assigned.id} assigned to order ${orderId}`);
  return assigned;
}

export async function fulfillPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    console.error(`[Fulfillment] Order ${orderId} not found`);
    return { status: "missing" as const };
  }

  if (order.status === "delivered") {
    return { status: "delivered" as const, alreadyDelivered: true };
  }

  let allKeysAssigned = true;

  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i += 1) {
      const key = await assignKey(order.id, item.productId);
      if (!key) {
        allKeysAssigned = false;
      }
    }
  }

  if (allKeysAssigned) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "delivered",
        deliveredAt: new Date(),
      },
    });
    console.log(`[Fulfillment] Order ${order.id} fully delivered`);
    return { status: "delivered" as const, alreadyDelivered: false };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "review" },
  });
  console.warn(`[Fulfillment] Order ${order.id} needs review`);

  return { status: "review" as const, alreadyDelivered: false };
}
