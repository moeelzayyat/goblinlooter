import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/btcpay";
import { prisma } from "@/lib/prisma";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { auth } from "@/lib/auth";

function getRequestOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = forwardedHost || req.headers.get("host");
  const envOrigin = process.env.AUTH_URL || process.env.NEXTAUTH_URL;

  if (host) {
    const proto =
      forwardedProto || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return envOrigin || req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
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

    if (!session?.user?.id) {
      const origin = getRequestOrigin(req);
      const loginUrl = new URL("/auth/login", origin);
      loginUrl.searchParams.set("callbackUrl", `/shop/${product.slug}`);

      return NextResponse.json(
        {
          error: "Please log in before starting checkout.",
          loginUrl: loginUrl.toString(),
        },
        { status: 401 }
      );
    }

    const orderId = `GL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const origin = getRequestOrigin(req);
    const successUrl = new URL("/checkout/success", origin);
    successUrl.searchParams.set("orderId", orderId);

    let dbOrder;
    try {
      const dbProduct = await prisma.product.findUnique({
        where: { slug: productSlug },
      });

      dbOrder = await prisma.order.create({
        data: {
          id: orderId,
          customerId: session.user.id,
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
      console.warn("[Checkout] Could not create DB order:", dbError);
    }

    const invoice = await createInvoice({
      amount: product.price,
      currency: "USD",
      orderId: dbOrder?.id || orderId,
      itemDescription: product.title,
      buyerEmail: buyerEmail || session.user.email || undefined,
      redirectURL: successUrl.toString(),
    });

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
    const message = error instanceof Error ? error.message : "Unknown error";
    const normalizedMessage = message.toLowerCase();
    const isTimeout = normalizedMessage.includes("timed out");
    const isFullNodeUnavailable = normalizedMessage.includes(
      "full node not available"
    );
    const isPaymentMethodUnavailable = normalizedMessage.includes(
      "payment method unavailable"
    );
    const isRateUnavailable = normalizedMessage.includes(
      "error retrieving a matching payment method or rate"
    );
    const isNodeSync = normalizedMessage.includes("synchron");

    let userError: string;
    let status: number;
    let code: string;
    let retryable = false;

    if (
      isFullNodeUnavailable ||
      isPaymentMethodUnavailable ||
      isRateUnavailable
    ) {
      userError =
        "Crypto payments are temporarily unavailable because our BTCPay node is offline or not fully synced. Please try again later.";
      status = 503;
      code = "payments_temporarily_unavailable";
      retryable = true;
    } else if (isTimeout || isNodeSync) {
      userError =
        "Payment system is currently syncing with the blockchain network. This is temporary - please try again in a little while.";
      status = 503;
      code = "payments_temporarily_unavailable";
      retryable = true;
    } else {
      userError = "Failed to create checkout session. Please try again later.";
      status = 500;
      code = "checkout_failed";
    }

    return NextResponse.json(
      { error: userError, details: message, code, retryable },
      { status }
    );
  }
}
