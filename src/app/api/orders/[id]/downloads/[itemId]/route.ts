import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeProductFileName } from "@/lib/product-files";

function contentDisposition(fileName: string) {
  const safeName = sanitizeProductFileName(fileName);
  const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");
  const encodedName = encodeURIComponent(safeName);

  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, itemId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId: session.user.id,
      status: "delivered",
    },
    select: {
      id: true,
      items: {
        where: { id: itemId },
        select: {
          id: true,
          product: {
            select: {
              productFile: {
                select: {
                  fileName: true,
                  contentType: true,
                  sizeBytes: true,
                  data: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const file = order?.items[0]?.product?.productFile;
  if (!file) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(file.data), {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": contentDisposition(file.fileName),
      "Content-Length": file.sizeBytes.toString(),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
