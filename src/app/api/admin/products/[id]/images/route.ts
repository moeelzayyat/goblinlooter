import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import {
  getUploadedProductImageId,
  validateProductImage,
} from "@/lib/product-images";
import { prisma } from "@/lib/prisma";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true, images: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a product image." }, { status: 400 });
    }

    const validation = validateProductImage(file);
    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        fileName: validation.fileName,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        data: Buffer.from(await file.arrayBuffer()),
      },
    });
    const imageUrl = `/api/products/${product.id}/images/${image.id}`;
    const images = [...product.images, imageUrl];

    await prisma.product.update({
      where: { id: product.id },
      data: { images },
    });

    const updatedProduct = await getAdminProductById(product.id);

    revalidatePath("/admin");
    revalidatePath("/shop");
    revalidatePath(`/shop/${product.slug}`);

    return NextResponse.json({ product: updatedProduct, imageUrl });
  } catch (error) {
    console.error("[Admin] Upload product image failed:", error);
    return NextResponse.json(
      { error: "Failed to upload product image." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true, images: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
    }

    const images = product.images.filter((image) => image !== imageUrl);
    const imageId = getUploadedProductImageId(product.id, imageUrl);

    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { images },
      }),
      ...(imageId
        ? [
            prisma.productImage.deleteMany({
              where: { id: imageId, productId: product.id },
            }),
          ]
        : []),
    ]);

    const updatedProduct = await getAdminProductById(product.id);

    revalidatePath("/admin");
    revalidatePath("/shop");
    revalidatePath(`/shop/${product.slug}`);

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("[Admin] Remove product image failed:", error);
    return NextResponse.json(
      { error: "Failed to remove product image." },
      { status: 500 }
    );
  }
}
