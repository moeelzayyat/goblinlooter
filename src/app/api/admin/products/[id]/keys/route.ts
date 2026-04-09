import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import {
  getAdminProductById,
  normalizeKeyInput,
} from "@/lib/admin-products";
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
      select: { id: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = normalizeKeyInput(body.keys);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await prisma.inventoryKey.createMany({
      data: parsed.keys.map((keyValue) => ({
        productId: id,
        keyValue,
        status: "available",
      })),
    });

    const updatedProduct = await getAdminProductById(id);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${product.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      product: updatedProduct,
      addedCount: parsed.keys.length,
    });
  } catch (error) {
    console.error("[Admin] Add keys failed:", error);
    return NextResponse.json(
      { error: "Failed to add keys." },
      { status: 500 }
    );
  }
}
