import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import { validateProductVideo } from "@/lib/product-videos";

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
      select: { id: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("video");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a product video." }, { status: 400 });
    }

    const validation = validateProductVideo(file);
    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const content = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";

    await prisma.productVideo.upsert({
      where: { productId: product.id },
      update: {
        fileName: validation.fileName,
        contentType,
        sizeBytes: file.size,
        data: content,
      },
      create: {
        productId: product.id,
        fileName: validation.fileName,
        contentType,
        sizeBytes: file.size,
        data: content,
      },
    });

    const updatedProduct = await getAdminProductById(product.id);

    revalidatePath("/admin");
    revalidatePath(`/shop/${product.slug}`);

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("[Admin] Upload product video failed:", error);
    return NextResponse.json(
      { error: "Failed to upload product video." },
      { status: 500 }
    );
  }
}
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await prisma.productVideo.deleteMany({
      where: { productId: product.id },
    });

    const updatedProduct = await getAdminProductById(product.id);

    revalidatePath("/admin");
    revalidatePath(`/shop/${product.slug}`);

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("[Admin] Remove product video failed:", error);
    return NextResponse.json(
      { error: "Failed to remove product video." },
      { status: 500 }
    );
  }
}
