import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

async function getProductAndKey(id: string, keyId: string) {
  const key = await prisma.inventoryKey.findUnique({
    where: { id: keyId },
    select: {
      id: true,
      productId: true,
      status: true,
      orderId: true,
    },
  });

  if (!key || key.productId !== id) {
    return { error: NextResponse.json({ error: "Key not found." }, { status: 404 }) };
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!product) {
    return {
      error: NextResponse.json({ error: "Product not found." }, { status: 404 }),
    };
  }

  return { key, product };
}

function isLockedKey(status: string, orderId: string | null) {
  return status === "assigned" || Boolean(orderId);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { id, keyId } = await params;
    const result = await getProductAndKey(id, keyId);
    if ("error" in result) return result.error;

    if (isLockedKey(result.key.status, result.key.orderId)) {
      return NextResponse.json(
        { error: "Assigned keys cannot be edited." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const keyValue =
      typeof body.keyValue === "string" ? body.keyValue.trim() : "";

    if (!keyValue) {
      return NextResponse.json({ error: "Key value is required." }, { status: 400 });
    }

    await prisma.inventoryKey.update({
      where: { id: keyId },
      data: { keyValue },
    });

    const product = await getAdminProductById(id);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${result.product.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[Admin] Update key failed:", error);
    return NextResponse.json(
      { error: "Failed to update key." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { id, keyId } = await params;
    const result = await getProductAndKey(id, keyId);
    if ("error" in result) return result.error;

    if (isLockedKey(result.key.status, result.key.orderId)) {
      return NextResponse.json(
        { error: "Assigned keys cannot be removed." },
        { status: 409 }
      );
    }

    await prisma.inventoryKey.delete({
      where: { id: keyId },
    });

    const product = await getAdminProductById(id);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${result.product.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[Admin] Delete key failed:", error);
    return NextResponse.json(
      { error: "Failed to delete key." },
      { status: 500 }
    );
  }
}
