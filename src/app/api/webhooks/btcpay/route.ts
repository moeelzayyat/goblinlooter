import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // BTCPay sends webhook events for invoice status changes
    // Common statuses: New, Processing, Expired, Invalid, Settled, Complete
    const { type, invoiceId, metadata } = body;

    console.log(`[BTCPay Webhook] ${type} — Invoice: ${invoiceId}`, metadata);

    // Handle different invoice statuses
    switch (type) {
      case "InvoiceSettled":
        // Payment confirmed — deliver the product key
        console.log(
          `✅ Payment confirmed for order ${metadata?.orderId}. Delivering key...`
        );
        // TODO: Implement key delivery logic
        // await deliverProductKey(metadata.orderId, metadata.buyerEmail);
        break;

      case "InvoiceExpired":
        console.log(`⏰ Invoice expired: ${invoiceId}`);
        break;

      case "InvoiceInvalid":
        console.log(`❌ Invoice invalid: ${invoiceId}`);
        break;

      case "InvoiceProcessing":
        console.log(`⏳ Payment processing: ${invoiceId}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
