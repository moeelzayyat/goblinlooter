import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import {
  getAdminProductById,
  normalizeProductInput,
} from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const { id } = await params;
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = normalizeProductInput(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const slugOwner = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json(
        { error: "Another product already uses that slug." },
        { status: 409 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });
    const product = await getAdminProductById(updated.id);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${existing.slug}`);
    revalidatePath(`/shop/${updated.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[Admin] Update product failed:", error);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}
