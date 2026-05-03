import { NextRequest, NextResponse } from "next/server";
import { sanitizeProductImageFileName } from "@/lib/product-images";
import { prisma } from "@/lib/prisma";

function contentDisposition(fileName: string) {
  const safeName = sanitizeProductImageFileName(fileName);
  const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");
  const encodedName = encodeURIComponent(safeName);

  return `inline; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id, imageId } = await params;

  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId: id,
      product: {
        status: "published",
      },
    },
    select: {
      fileName: true,
      contentType: true,
      sizeBytes: true,
      data: true,
    },
  });

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(image.data), {
    headers: {
      "Content-Type": image.contentType || "application/octet-stream",
      "Content-Disposition": contentDisposition(image.fileName),
      "Content-Length": image.sizeBytes.toString(),
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
