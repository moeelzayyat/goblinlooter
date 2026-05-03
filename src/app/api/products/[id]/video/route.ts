import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeProductVideoFileName } from "@/lib/product-videos";

function contentDisposition(fileName: string) {
  const safeName = sanitizeProductVideoFileName(fileName);
  const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");
  const encodedName = encodeURIComponent(safeName);

  return `inline; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      id,
      status: "published",
    },
    select: {
      productVideo: {
        select: {
          fileName: true,
          contentType: true,
          sizeBytes: true,
          data: true,
        },
      },
    },
  });

  const video = product?.productVideo;
  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const buffer = Buffer.from(video.data);
  const range = req.headers.get("range");
  const headers = {
    "Content-Type": video.contentType || "application/octet-stream",
    "Content-Disposition": contentDisposition(video.fileName),
    "Cache-Control": "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };

  if (range) {
    const match = range.match(/^bytes=(\d*)-(\d*)$/);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Number(match[2]) : buffer.length - 1;

    if (
      !match ||
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end < start ||
      start >= buffer.length
    ) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          ...headers,
          "Content-Range": `bytes */${buffer.length}`,
        },
      });
    }

    const chunk = buffer.subarray(start, Math.min(end, buffer.length - 1) + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: {
        ...headers,
        "Content-Length": chunk.length.toString(),
        "Content-Range": `bytes ${start}-${start + chunk.length - 1}/${buffer.length}`,
      },
    });
  }

  return new NextResponse(buffer, {
    headers: {
      ...headers,
      "Content-Length": video.sizeBytes.toString(),
    },
  });
}
