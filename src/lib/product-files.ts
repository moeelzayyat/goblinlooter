const MAX_PRODUCT_FILE_BYTES = 100 * 1024 * 1024;

const ALLOWED_PRODUCT_FILE_EXTENSIONS = new Set([
  ".exe",
  ".msi",
  ".zip",
  ".7z",
  ".rar",
]);

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}

export function sanitizeProductFileName(fileName: string) {
  const fallbackName = "product-download.bin";
  const cleaned = fileName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return cleaned || fallbackName;
}

export function validateProductFile(file: File) {
  if (file.size <= 0) {
    return { error: "Choose a non-empty file." };
  }

  if (file.size > MAX_PRODUCT_FILE_BYTES) {
    return { error: "Product files must be 100 MB or smaller." };
  }

  const fileName = sanitizeProductFileName(file.name);
  const extension = getFileExtension(fileName);

  if (!ALLOWED_PRODUCT_FILE_EXTENSIONS.has(extension)) {
    return { error: "Upload an EXE, MSI, ZIP, 7Z, or RAR file." };
  }

  return { fileName };
}

export function formatProductFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = sizeBytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
