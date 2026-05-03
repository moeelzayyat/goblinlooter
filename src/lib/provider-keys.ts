import type { PurchaseOption } from "@/types";

type ProviderKeyResult =
  | { keyValue: string }
  | { error: string; status?: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractKeyFromJson(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const keyValue = extractKeyFromJson(entry);
      if (keyValue) return keyValue;
    }

    return null;
  }

  if (!isRecord(value)) return extractString(value);

  const direct =
    extractString(value.key) ||
    extractString(value.licenseKey) ||
    extractString(value.license_key) ||
    extractString(value.license) ||
    extractString(value.code) ||
    extractString(value.value);

  if (direct) return direct;

  if (isRecord(value.data)) {
    return extractKeyFromJson(value.data);
  }

  if (isRecord(value.result)) {
    return extractKeyFromJson(value.result);
  }

  if (Array.isArray(value.keys)) {
    return extractKeyFromJson(value.keys);
  }

  if (Array.isArray(value.licenses)) {
    return extractKeyFromJson(value.licenses);
  }

  return null;
}

export function getProviderKeyUrlForOption(
  purchaseOptions: unknown,
  purchaseOptionId: string | null
) {
  if (!Array.isArray(purchaseOptions) || !purchaseOptionId) return null;

  const option = purchaseOptions.find((entry) => {
    if (!isRecord(entry)) return false;
    return entry.id === purchaseOptionId;
  }) as (PurchaseOption & { providerKeyUrl?: string | null }) | undefined;

  const providerKeyUrl = option?.providerKeyUrl;
  if (typeof providerKeyUrl !== "string" || !providerKeyUrl.trim()) return null;

  try {
    const url = new URL(providerKeyUrl.trim());
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function requestProviderKey(providerKeyUrl: string): Promise<ProviderKeyResult> {
  const response = await fetch(providerKeyUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json, text/plain;q=0.9",
    },
  });

  const text = await response.text();

  if (!response.ok) {
    return {
      error: "provider_request_failed",
      status: response.status,
    };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "provider_returned_empty_key" };
  }

  try {
    const json = JSON.parse(trimmed);
    const keyValue = extractKeyFromJson(json);
    if (keyValue) return { keyValue };
  } catch {
    // Plain-text provider responses are supported below.
  }

  return { keyValue: trimmed };
}
