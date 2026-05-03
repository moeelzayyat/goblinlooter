const MAX_PRODUCT_IMAGE_BYTES = 12 * 1024 * 1024;

const ALLOWED_PRODUCT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_PRODUCT_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function sanitizeProductImageFileName(fileName: string) {
  const fallbackName = "product-image.png";
  const cleaned = fileName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return cleaned || fallbackName;
}

export function validateProductImage(file: File) {
  if (file.size <= 0) {
    return { error: "Choose a non-empty image file." };
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return { error: "Product images must be 12 MB or smaller." };
  }

  const fileName = sanitizeProductImageFileName(file.name);
  const extension = getFileExtension(fileName);

  if (!ALLOWED_PRODUCT_IMAGE_EXTENSIONS.has(extension)) {
    return { error: "Upload a JPG, PNG, WebP, or GIF image." };
  }

  if (file.type && !ALLOWED_PRODUCT_IMAGE_TYPES.has(file.type)) {
    return { error: "Upload a JPG, PNG, WebP, or GIF image." };
  }

  return { fileName };
}

export function getUploadedProductImageId(
  productId: string,
  imageUrl: string
) {
  const escapedProductId = productId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = imageUrl.match(
    new RegExp(`/api/products/${escapedProductId}/images/([^/?#]+)`)
  );

  return match?.[1] || null;
}
