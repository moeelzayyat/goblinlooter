import type { ProductSetupGuide } from "@/types";

export function normalizeSetupGuide(value: unknown): ProductSetupGuide | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const data = value as Record<string, unknown>;
  const videoUrl =
    typeof data.videoUrl === "string" && data.videoUrl.trim()
      ? data.videoUrl.trim()
      : null;
  const steps = Array.isArray(data.steps)
    ? data.steps
        .map((step) => (typeof step === "string" ? step.trim() : ""))
        .filter(Boolean)
    : [];
  const fixes = Array.isArray(data.fixes)
    ? data.fixes
        .map((entry) => {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return null;
          }

          const fixEntry = entry as Record<string, unknown>;
          const error =
            typeof fixEntry.error === "string" ? fixEntry.error.trim() : "";
          const fix = typeof fixEntry.fix === "string" ? fixEntry.fix.trim() : "";
          return error && fix ? { error, fix } : null;
        })
        .filter((entry): entry is { error: string; fix: string } => Boolean(entry))
    : [];
  const notes =
    typeof data.notes === "string" && data.notes.trim()
      ? data.notes.trim()
      : null;

  if (!videoUrl && steps.length === 0 && fixes.length === 0 && !notes) return null;

  return { videoUrl, steps, fixes, notes };
}

export function getEmbeddableVideoUrl(url: string | null | undefined) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
  } catch {
    return url;
  }

  return url;
}

export function isDirectVideoUrl(url: string | null | undefined) {
  return Boolean(url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url));
}
