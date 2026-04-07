/* BTCPay Server API client */

const BTCPAY_URL = process.env.BTCPAY_URL || "https://pay.goblinlooter.com";
const BTCPAY_API_KEY = process.env.BTCPAY_API_KEY || "";
const BTCPAY_STORE_ID = process.env.BTCPAY_STORE_ID || "";

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

export async function createInvoice(
  opts: CreateInvoiceOptions
): Promise<BTCPayInvoice> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

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
            redirectURL:
              opts.redirectURL || "https://goblinlooter.com/checkout/success",
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
      throw new Error(
        `BTCPay invoice creation failed: ${res.status} — ${err}`
      );
    }

    return res.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("[BTCPay] Request timed out after 30s");
      throw new Error("BTCPay request timed out — server may be syncing");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getInvoice(invoiceId: string): Promise<BTCPayInvoice> {
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
