import type { AnalyticsEventType } from "@/types";

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === "undefined") return "server";
  sessionId =
    sessionStorage.getItem("gl_sid") ??
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("gl_sid", id);
      return id;
    })();
  return sessionId;
}

export function trackEvent(
  event: AnalyticsEventType,
  data?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    data: data ?? null,
    sessionId: getSessionId(),
  };

  // Fire-and-forget — don't block rendering
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently fail — analytics should never break the UI
  });
}
