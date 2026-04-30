import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillPaidOrder } from "@/lib/order-fulfillment";
import { prisma } from "@/lib/prisma";
import {
  getStripe,
  getStripeWebhookSecret,
  resolveStripePaymentDetails,
} from "@/lib/stripe";

async function findOrderForSession(session: Stripe.Checkout.Session) {
  const orderId =
    session.metadata?.orderId || session.client_reference_id || undefined;

  if (session.id) {
    const order = await prisma.order.findFirst({
      where: { stripeCheckoutSessionId: session.id },
    });

    if (order) return order;
  }

  if (!orderId) return null;

  return prisma.order.findFirst({
    where: { id: orderId },
  });
}

async function settleCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    console.log(
      `[Stripe Webhook] Session ${session.id} not paid: ${session.payment_status}`
    );
    return;
  }

  const order = await findOrderForSession(session);

  if (!order) {
    console.error(`[Stripe Webhook] No order found for session ${session.id}`);
    return;
  }

  const { paymentIntentId, paymentMethod } =
    await resolveStripePaymentDetails(session);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "paid",
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      paymentMethod,
    },
  });

  await prisma.orderMeta
    .update({
      where: { orderId: order.id },
      data: {
        txId: paymentIntentId,
        paymentMethod,
      },
    })
    .catch(() => {
      // Metadata may be missing on older orders.
    });

  await fulfillPaidOrder(order.id);
}

async function cancelPendingSession(session: Stripe.Checkout.Session) {
  const order = await findOrderForSession(session);
  if (!order || order.status !== "pending") return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "cancelled" },
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret()
    );
  } catch (error) {
    console.error("[Stripe Webhook] Invalid signature:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await settleCheckoutSession(event.data.object);
        break;

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await cancelPendingSession(event.data.object);
        break;

      case "charge.dispute.created": {
        const charge = event.data.object;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (paymentIntentId) {
          await prisma.order.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { status: "chargeback" },
          });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
