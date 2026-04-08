import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET || "";

/* ── Verify BTCPay HMAC-SHA256 signature ── */
async function verifySignature(
  payload: string,
  sigHeader: string | null
): Promise<boolean> {
  if (!WEBHOOK_SECRET || !sigHeader) return false;
  // BTCPay sends: sha256=HEXDIGEST
  const expected = sigHeader.replace("sha256=", "");
  const hmac = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
}

/* ── Assign an inventory key to an order ── */
async function assignKey(orderId: string, productId: string) {
  // Find an available key for this product
  const key = await prisma.inventoryKey.findFirst({
    where: { productId, status: "available" },
    orderBy: { createdAt: "asc" }, // FIFO
  });

  if (!key) {
    console.error(
      `[Webhook] No available keys for product ${productId}, order ${orderId}`
    );
    // Log the failure
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

  // Assign the key to this order
  const assigned = await prisma.inventoryKey.update({
    where: { id: key.id },
    data: {
      status: "assigned",
      orderId,
      assignedAt: new Date(),
    },
  });

  // Audit log
  await prisma.deliveryAuditLog.create({
    data: {
      orderId,
      keyId: assigned.id,
      action: "key_assigned",
      metadata: { productId },
      performedBy: "system",
    },
  });

  console.log(`[Webhook] Key ${assigned.id} assigned to order ${orderId}`);
  return assigned;
}

/* ── Main handler ── */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify signature (skip in dev if no secret configured)
  const sig = req.headers.get("btcpay-sig");
  if (WEBHOOK_SECRET) {
    const valid = await verifySignature(rawBody, sig);
    if (!valid) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody);

    // BTCPay webhook payload structure
    const {
      type,
      invoiceId,
      metadata,
      afterExpiration,
    } = body;

    console.log(
      `[BTCPay Webhook] ${type} — Invoice: ${invoiceId}`,
      JSON.stringify(metadata)
    );

    switch (type) {
      /* ─────────────────────────────────────────────
       * InvoiceSettled — Payment fully confirmed
       * This is the main delivery trigger
       * ───────────────────────────────────────────── */
      case "InvoiceSettled": {
        const orderId = metadata?.orderId as string | undefined;
        if (!orderId) {
          console.error("[Webhook] InvoiceSettled missing orderId in metadata");
          break;
        }

        // Find the order
        let order = await prisma.order.findFirst({
          where: { btcpayInvoiceId: invoiceId },
          include: { items: true },
        });

        // If order doesn't exist yet (could happen if checkout didn't save it),
        // create it from the metadata
        if (!order) {
          console.log(
            `[Webhook] Order not found for invoice ${invoiceId}, looking up by orderId ${orderId}`
          );
          order = await prisma.order.findFirst({
            where: { id: orderId },
            include: { items: true },
          });
        }

        if (!order) {
          console.error(
            `[Webhook] No order found for invoice ${invoiceId} / orderId ${orderId}`
          );
          break;
        }

        // Update order status to paid
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "paid",
            btcpayInvoiceId: invoiceId,
          },
        });

        // Assign keys for each order item
        let allKeysAssigned = true;
        for (const item of order.items) {
          for (let i = 0; i < item.quantity; i++) {
            const key = await assignKey(order.id, item.productId);
            if (!key) allKeysAssigned = false;
          }
        }

        // If all keys assigned, mark as delivered
        if (allKeysAssigned) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "delivered",
              deliveredAt: new Date(),
            },
          });
          console.log(`✅ Order ${order.id} fully delivered`);
        } else {
          // Mark for manual review
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "review" },
          });
          console.warn(
            `⚠️ Order ${order.id} needs review — some keys unavailable`
          );
        }
        break;
      }

      /* ─────────────────────────────────────────────
       * InvoiceProcessing — Payment received, waiting for confirmations
       * ───────────────────────────────────────────── */
      case "InvoiceProcessing": {
        const orderId = metadata?.orderId as string | undefined;
        if (orderId) {
          await prisma.order
            .updateMany({
              where: {
                OR: [
                  { btcpayInvoiceId: invoiceId },
                  { id: orderId },
                ],
              },
              data: {
                status: "pending",
                btcpayInvoiceId: invoiceId,
              },
            })
            .catch(() => {
              /* order may not exist yet */
            });
        }
        console.log(`⏳ Payment processing for invoice ${invoiceId}`);
        break;
      }

      /* ─────────────────────────────────────────────
       * InvoiceExpired — Invoice timed out without payment
       * ───────────────────────────────────────────── */
      case "InvoiceExpired": {
        if (!afterExpiration) {
          // Only cancel if no late payment came in
          const orderId = metadata?.orderId as string | undefined;
          if (orderId) {
            await prisma.order
              .updateMany({
                where: {
                  OR: [
                    { btcpayInvoiceId: invoiceId },
                    { id: orderId },
                  ],
                },
                data: { status: "cancelled" },
              })
              .catch(() => {});
          }
          console.log(`⏰ Invoice expired: ${invoiceId}`);
        }
        break;
      }

      /* ─────────────────────────────────────────────
       * InvoiceInvalid — Double-spend or other issue
       * ───────────────────────────────────────────── */
      case "InvoiceInvalid": {
        const orderId = metadata?.orderId as string | undefined;
        if (orderId) {
          await prisma.order
            .updateMany({
              where: {
                OR: [
                  { btcpayInvoiceId: invoiceId },
                  { id: orderId },
                ],
              },
              data: { status: "cancelled" },
            })
            .catch(() => {});

          // Revoke any assigned keys
          const keys = await prisma.inventoryKey.findMany({
            where: { order: { btcpayInvoiceId: invoiceId } },
          });
          for (const key of keys) {
            await prisma.inventoryKey.update({
              where: { id: key.id },
              data: { status: "available", orderId: null, assignedAt: null },
            });
            await prisma.deliveryAuditLog.create({
              data: {
                orderId: key.orderId!,
                keyId: key.id,
                action: "key_revoked",
                metadata: { reason: "invoice_invalid", invoiceId },
                performedBy: "system",
              },
            });
          }
        }
        console.log(`❌ Invoice invalid: ${invoiceId}`);
        break;
      }

      /* ─────────────────────────────────────────────
       * InvoicePaymentSettled — individual payment settled (multi-payment invoices)
       * ───────────────────────────────────────────── */
      case "InvoicePaymentSettled": {
        console.log(
          `💰 Partial payment settled for invoice ${invoiceId}:`,
          JSON.stringify(body.payment)
        );
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
