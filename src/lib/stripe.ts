import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET.");
  }

  return webhookSecret;
}

export function normalizeStripePaymentMethod(type?: string | null) {
  if (type === "card") return "CARD";
  if (type === "cashapp") return "CASHAPP";
  return "STRIPE";
}

export async function createStripeCheckoutSession({
  amount,
  buyerEmail,
  cancelUrl,
  orderId,
  productSlug,
  productTitle,
  successUrl,
}: {
  amount: number;
  buyerEmail?: string | null;
  cancelUrl: string;
  orderId: string;
  productSlug: string;
  productTitle: string;
  successUrl: string;
}) {
  const unitAmount = Math.round(amount * 100);

  if (unitAmount < 50) {
    throw new Error("Stripe checkout requires an order total of at least $0.50.");
  }

  return getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "cashapp"],
    payment_method_options: {
      card: {
        request_three_d_secure: "any",
      },
    },
    client_reference_id: orderId,
    customer_email: buyerEmail || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: productTitle,
          },
        },
      },
    ],
    metadata: {
      orderId,
      productSlug,
    },
    payment_intent_data: {
      metadata: {
        orderId,
        productSlug,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function resolveStripePaymentDetails(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  if (!paymentIntentId) {
    return {
      paymentIntentId: null,
      paymentMethod: "STRIPE",
    };
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });
  const latestCharge =
    typeof paymentIntent.latest_charge === "string"
      ? null
      : paymentIntent.latest_charge;

  return {
    paymentIntentId,
    paymentMethod: normalizeStripePaymentMethod(
      latestCharge?.payment_method_details?.type
    ),
  };
}
