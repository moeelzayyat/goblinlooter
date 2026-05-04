import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createInvoice } from "@/lib/btcpay";
import { ensureDatabaseProduct, getCatalogProductBySlug } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { createStripeCheckoutSession } from "@/lib/stripe";

type CheckoutProvider = "stripe" | "btcpay";

function resolvePurchaseSelection(
  product: NonNullable<Awaited<ReturnType<typeof getCatalogProductBySlug>>>,
  value: unknown
) {
  const options = product.purchaseOptions || [];
  if (options.length === 0) {
    return {
      amount: product.price,
      optionId: null,
      optionLabel: null,
      itemTitle: product.title,
    };
  }

  const requestedId = typeof value === "string" ? value : "";
  const selected =
    options.find((option) => option.id === requestedId) ||
    (!requestedId ? options[0] : null);

  if (!selected) {
    return { error: "Selected duration option is invalid." };
  }

  return {
    amount: selected.price,
    optionId: selected.id,
    optionLabel: selected.label,
    itemTitle: `${product.title} - ${selected.label}`,
  };
}

function getRequestOrigin(req: NextRequest) {
  const envOrigin = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (envOrigin) {
    return new URL(envOrigin).origin;
  }

  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = forwardedHost || req.headers.get("host");

  if (host) {
    const proto =
      forwardedProto || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return req.nextUrl.origin;
}

function getProvider(value: unknown): CheckoutProvider {
  return value === "btcpay" ? "btcpay" : "stripe";
}

function getSuccessUrl(origin: string, orderId: string, provider: CheckoutProvider) {
  const successUrl = new URL("/checkout/success", origin);
  successUrl.searchParams.set("orderId", orderId);

  if (provider === "stripe") {
    return `${successUrl.toString()}&session_id={CHECKOUT_SESSION_ID}`;
  }

  return successUrl.toString();
}

function getCancelUrl(origin: string, productSlug: string) {
  const cancelUrl = new URL(`/shop/${productSlug}`, origin);
  cancelUrl.searchParams.set("checkout", "cancelled");
  return cancelUrl.toString();
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { productSlug, buyerEmail, purchaseOptionId } = body;
    const paymentProvider = getProvider(body.paymentProvider);

    if (!productSlug) {
      return NextResponse.json(
        { error: "Missing productSlug" },
        { status: 400 }
      );
    }

    const product = await getCatalogProductBySlug(productSlug);
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
    const customerEmail = buyerEmail || session.user.email || undefined;
    const dbProduct = await ensureDatabaseProduct(productSlug);
    const purchaseSelection = resolvePurchaseSelection(product, purchaseOptionId);

    if (!dbProduct) {
      return NextResponse.json(
        { error: "Product is not ready for checkout." },
        { status: 409 }
      );
    }

    if ("error" in purchaseSelection) {
      return NextResponse.json(
        { error: purchaseSelection.error },
        { status: 400 }
      );
    }

    const dbOrder = await prisma.order.create({
      data: {
        id: orderId,
        customerId: session.user.id,
        status: "pending",
        totalAmount: purchaseSelection.amount,
        paymentMethod: paymentProvider === "stripe" ? "STRIPE" : "BTCPAY",
        items: {
          create: {
            productId: dbProduct.id,
            quantity: 1,
            unitPrice: purchaseSelection.amount,
            purchaseOptionId: purchaseSelection.optionId,
            purchaseOptionLabel: purchaseSelection.optionLabel,
          },
        },
      },
    });

    await prisma.orderMeta
      .create({
        data: {
          orderId: dbOrder.id,
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          country: req.headers.get("cf-ipcountry") || null,
          paymentMethod: paymentProvider === "stripe" ? "STRIPE" : "BTCPAY",
        },
      })
      .catch(() => {
        // Non-critical metadata; checkout can continue.
      });

    if (paymentProvider === "btcpay") {
      const invoice = await createInvoice({
        amount: purchaseSelection.amount,
        currency: "USD",
        orderId: dbOrder.id,
        itemDescription: purchaseSelection.itemTitle,
        buyerEmail: customerEmail,
        redirectURL: getSuccessUrl(origin, dbOrder.id, paymentProvider),
      });

      await prisma.order.update({
        where: { id: dbOrder.id },
        data: { btcpayInvoiceId: invoice.id },
      });

      return NextResponse.json({
        invoiceId: invoice.id,
        checkoutUrl: invoice.checkoutLink,
        orderId: dbOrder.id,
        provider: paymentProvider,
      });
    }

    const checkoutSession = await createStripeCheckoutSession({
      amount: purchaseSelection.amount,
      buyerEmail: customerEmail,
      cancelUrl: getCancelUrl(origin, product.slug),
      orderId: dbOrder.id,
      productSlug: product.slug,
      productTitle: purchaseSelection.itemTitle,
      successUrl: getSuccessUrl(origin, dbOrder.id, paymentProvider),
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    await prisma.order.update({
      where: { id: dbOrder.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      orderId: dbOrder.id,
      provider: paymentProvider,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const normalizedMessage = message.toLowerCase();
    const isStripeConfigError = normalizedMessage.includes(
      "stripe is not configured"
    );
    const isStripeError =
      normalizedMessage.includes("stripe") ||
      normalizedMessage.includes("cashapp") ||
      normalizedMessage.includes("card");
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

    if (isStripeConfigError) {
      userError =
        "Card and Cash App checkout is temporarily unavailable. Please contact support or try another payment option.";
      status = 503;
      code = "stripe_not_configured";
      retryable = false;
    } else if (isStripeError) {
      userError =
        "Card and Cash App checkout is temporarily unavailable. Please try again later.";
      status = 503;
      code = "stripe_checkout_unavailable";
      retryable = true;
    } else if (
      isFullNodeUnavailable ||
      isPaymentMethodUnavailable ||
      isRateUnavailable
    ) {
      userError =
        "Payments are temporarily unavailable because our payment processor is offline or not fully synced. Please try again later.";
      status = 503;
      code = "payments_temporarily_unavailable";
      retryable = true;
    } else if (isTimeout || isNodeSync) {
      userError =
        "Payment system is currently syncing with the payment network. This is temporary - please try again in a little while.";
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
