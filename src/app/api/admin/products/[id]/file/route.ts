import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import { validateProductFile } from "@/lib/product-files";

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
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a product file." }, { status: 400 });
    }

    const validation = validateProductFile(file);
    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const content = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";

    await prisma.productFile.upsert({
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
    console.error("[Admin] Upload product file failed:", error);
    return NextResponse.json(
      { error: "Failed to upload product file." },
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

    await prisma.productFile.deleteMany({
      where: { productId: product.id },
    });

    const updatedProduct = await getAdminProductById(product.id);

    revalidatePath("/admin");
    revalidatePath(`/shop/${product.slug}`);

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("[Admin] Remove product file failed:", error);
    return NextResponse.json(
      { error: "Failed to remove product file." },
      { status: 500 }
    );
  }
}
