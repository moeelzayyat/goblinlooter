/* BTCPay Server API client */

const BTCPAY_URL = process.env.BTCPAY_URL || "https://pay.goblinlooter.com";
const BTCPAY_API_KEY = process.env.BTCPAY_API_KEY || "";
const BTCPAY_STORE_ID = process.env.BTCPAY_STORE_ID || "";
const BTCPAY_REQUEST_TIMEOUT_MS = 45000;
const BTCPAY_MAX_ATTEMPTS = 2;

interface CreateInvoiceOptions {
  amount: number;
  currency?: string;
  orderId?: string;
  itemDescription?: string;
  buyerEmail?: string;
  redirectURL?: string;
  notificationUrl?: string;
}

interface BTCPayInvoice {
  id: string;
  checkoutLink: string;
  status: string;
  amount: string;
  currency: string;
}

function assertBTCPayConfig() {
  if (!BTCPAY_URL || !BTCPAY_API_KEY || !BTCPAY_STORE_ID) {
    throw new Error(
      "BTCPay is not fully configured. Set BTCPAY_URL, BTCPAY_API_KEY, and BTCPAY_STORE_ID."
    );
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableBTCPayFailure(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("timed out") ||
    normalized.includes("timeout") ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("full node not available") ||
    normalized.includes("payment method unavailable") ||
    normalized.includes("matching payment method or rate") ||
    normalized.includes("synchron")
  );
}

export async function createInvoice(
  opts: CreateInvoiceOptions
): Promise<BTCPayInvoice> {
  assertBTCPayConfig();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= BTCPAY_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      BTCPAY_REQUEST_TIMEOUT_MS
    );

    try {
      const res = await fetch(
        `${BTCPAY_URL}/api/v1/stores/${BTCPAY_STORE_ID}/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${BTCPAY_API_KEY}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            amount: opts.amount,
            currency: opts.currency || "USD",
            metadata: {
              orderId: opts.orderId,
              itemDesc: opts.itemDescription,
              buyerEmail: opts.buyerEmail,
            },
            checkout: {
              redirectURL: opts.redirectURL,
              redirectAutomatically: true,
              defaultLanguage: "en",
            },
            receipt: {
              enabled: true,
              showQR: true,
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error("[BTCPay] Invoice creation failed:", res.status, err);
        throw new Error(`BTCPay invoice creation failed: ${res.status} - ${err}`);
      }

      return res.json();
    } catch (error) {
      const normalizedError =
        error instanceof DOMException && error.name === "AbortError"
          ? new Error("BTCPay request timed out - server may be syncing")
          : error instanceof Error
            ? error
            : new Error("Unknown BTCPay error");

      lastError = normalizedError;

      if (
        attempt < BTCPAY_MAX_ATTEMPTS &&
        isRetriableBTCPayFailure(normalizedError.message)
      ) {
        console.warn(
          `[BTCPay] Retrying invoice creation after attempt ${attempt}:`,
          normalizedError.message
        );
        await sleep(1500);
        continue;
      }

      throw normalizedError;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error("BTCPay invoice creation failed");
}

export async function getInvoice(invoiceId: string): Promise<BTCPayInvoice> {
  assertBTCPayConfig();
  const res = await fetch(
    `${BTCPAY_URL}/api/v1/stores/${BTCPAY_STORE_ID}/invoices/${invoiceId}`,
    {
      headers: {
        Authorization: `token ${BTCPAY_API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch invoice: ${res.status}`);
  }

  return res.json();
}
