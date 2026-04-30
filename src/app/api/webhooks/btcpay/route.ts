import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { fulfillPaidOrder } from "@/lib/order-fulfillment";
import { prisma } from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET || "";

async function verifySignature(
  payload: string,
  sigHeader: string | null
): Promise<boolean> {
  if (!WEBHOOK_SECRET || !sigHeader) return false;

  const expected = sigHeader.replace("sha256=", "");
  const hmac = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("btcpay-sig");

  if (WEBHOOK_SECRET) {
    const valid = await verifySignature(rawBody, sig);
    if (!valid) {
      console.error("[BTCPay Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody);
    const { type, invoiceId, metadata, afterExpiration } = body;

    console.log(
      `[BTCPay Webhook] ${type} - Invoice: ${invoiceId}`,
      JSON.stringify(metadata)
    );

    switch (type) {
      case "InvoiceSettled": {
        const orderId = metadata?.orderId as string | undefined;
        if (!orderId) {
          console.error("[BTCPay Webhook] InvoiceSettled missing orderId");
          break;
        }

        let order = await prisma.order.findFirst({
          where: { btcpayInvoiceId: invoiceId },
        });

        if (!order) {
          order = await prisma.order.findFirst({
            where: { id: orderId },
          });
        }

        if (!order) {
          console.error(
            `[BTCPay Webhook] No order found for invoice ${invoiceId} / order ${orderId}`
          );
          break;
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "paid",
            btcpayInvoiceId: invoiceId,
          },
        });

        await fulfillPaidOrder(order.id);
        break;
      }

      case "InvoiceProcessing": {
        const orderId = metadata?.orderId as string | undefined;
        if (orderId) {
          await prisma.order
            .updateMany({
              where: {
                OR: [{ btcpayInvoiceId: invoiceId }, { id: orderId }],
              },
              data: {
                status: "pending",
                btcpayInvoiceId: invoiceId,
              },
            })
            .catch(() => {
              // The checkout route may still be creating the order.
            });
        }
        break;
      }

      case "InvoiceExpired": {
        if (!afterExpiration) {
          const orderId = metadata?.orderId as string | undefined;
          if (orderId) {
            await prisma.order
              .updateMany({
                where: {
                  OR: [{ btcpayInvoiceId: invoiceId }, { id: orderId }],
                },
                data: { status: "cancelled" },
              })
              .catch(() => {});
          }
        }
        break;
      }

      case "InvoiceInvalid": {
        const orderId = metadata?.orderId as string | undefined;
        if (orderId) {
          await prisma.order
            .updateMany({
              where: {
                OR: [{ btcpayInvoiceId: invoiceId }, { id: orderId }],
              },
              data: { status: "cancelled" },
            })
            .catch(() => {});

          const keys = await prisma.inventoryKey.findMany({
            where: { order: { btcpayInvoiceId: invoiceId } },
          });

          for (const key of keys) {
            const previousOrderId = key.orderId;
            await prisma.inventoryKey.update({
              where: { id: key.id },
              data: { status: "available", orderId: null, assignedAt: null },
            });

            if (previousOrderId) {
              await prisma.deliveryAuditLog.create({
                data: {
                  orderId: previousOrderId,
                  keyId: key.id,
                  action: "key_revoked",
                  metadata: { reason: "invoice_invalid", invoiceId },
                  performedBy: "system",
                },
              });
            }
          }
        }
        break;
      }

      case "InvoicePaymentSettled":
        break;

      default:
        console.log(`[BTCPay Webhook] Unhandled event: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[BTCPay Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
