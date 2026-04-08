import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/btcpay";
import { prisma } from "@/lib/prisma";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productSlug, buyerEmail } = body;

    if (!productSlug) {
      return NextResponse.json(
        { error: "Missing productSlug" },
        { status: 400 }
      );
    }

    const product = MOCK_PRODUCTS.find((p) => p.slug === productSlug);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const orderId = `GL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create order in database
    let dbOrder;
    try {
      // Try to find the product in DB first, fall back to mock ID
      const dbProduct = await prisma.product.findUnique({
        where: { slug: productSlug },
      });

      dbOrder = await prisma.order.create({
        data: {
          id: orderId,
          customerId: "guest", // will link to user when auth is wired up
          status: "pending",
          totalAmount: product.price,
          items: {
            create: {
              productId: dbProduct?.id || product.id,
              quantity: 1,
              unitPrice: product.price,
            },
          },
        },
      });
    } catch (dbError) {
      // DB may not be migrated yet — log but continue
      console.warn("[Checkout] Could not create DB order:", dbError);
    }

    // Create BTCPay invoice
    const invoice = await createInvoice({
      amount: product.price,
      currency: "USD",
      orderId: dbOrder?.id || orderId,
      itemDescription: product.title,
      buyerEmail: buyerEmail || undefined,
      redirectURL: `https://goblinlooter.com/checkout/success?orderId=${dbOrder?.id || orderId}`,
    });

    // Link invoice ID back to order
    if (dbOrder) {
      try {
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { btcpayInvoiceId: invoice.id },
        });
      } catch {
        console.warn("[Checkout] Could not update order with invoice ID");
      }
    }

    // Capture request metadata for risk analysis
    try {
      if (dbOrder) {
        await prisma.orderMeta.create({
          data: {
            orderId: dbOrder.id,
            ipAddress:
              req.headers.get("x-forwarded-for") ||
              req.headers.get("x-real-ip") ||
              "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            country: req.headers.get("cf-ipcountry") || null,
          },
        });
      }
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      invoiceId: invoice.id,
      checkoutUrl: invoice.checkoutLink,
      orderId: dbOrder?.id || orderId,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    const isTimeout = message.includes("timed out");
    const isNodeSync =
      message.includes("not available") ||
      message.includes("Payment method unavailable") ||
      message.includes("synchronized");

    let userError: string;
    let status: number;

    if (isTimeout || isNodeSync) {
      userError =
        "Payment system is currently syncing with the blockchain network. This is temporary — please try again in a few hours.";
      status = 503;
    } else {
      userError = "Failed to create checkout session. Please try again later.";
      status = 500;
    }

    return NextResponse.json(
      { error: userError, details: message },
      { status }
    );
  }
}
