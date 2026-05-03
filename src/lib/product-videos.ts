const MAX_PRODUCT_VIDEO_BYTES = 250 * 1024 * 1024;

const ALLOWED_PRODUCT_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

const ALLOWED_PRODUCT_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
]);

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function sanitizeProductVideoFileName(fileName: string) {
  const fallbackName = "product-video.mp4";
  const cleaned = fileName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return cleaned || fallbackName;
}

export function validateProductVideo(file: File) {
  if (file.size <= 0) {
    return { error: "Choose a non-empty video file." };
  }

  if (file.size > MAX_PRODUCT_VIDEO_BYTES) {
    return { error: "Product videos must be 250 MB or smaller." };
  }

  const fileName = sanitizeProductVideoFileName(file.name);
  const extension = getFileExtension(fileName);

  if (!ALLOWED_PRODUCT_VIDEO_EXTENSIONS.has(extension)) {
    return { error: "Upload an MP4, WebM, OGG, or MOV video." };
  }

  if (file.type && !ALLOWED_PRODUCT_VIDEO_TYPES.has(file.type)) {
    return { error: "Upload an MP4, WebM, OGG, or MOV video." };
  }

  return { fileName };
}
