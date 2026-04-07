import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/btcpay";
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

    const invoice = await createInvoice({
      amount: product.price,
      currency: "USD",
      orderId,
      itemDescription: product.title,
      buyerEmail: buyerEmail || undefined,
      redirectURL: `https://goblinlooter.com/checkout/success?orderId=${orderId}`,
    });

    return NextResponse.json({
      invoiceId: invoice.id,
      checkoutUrl: invoice.checkoutLink,
      orderId,
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
