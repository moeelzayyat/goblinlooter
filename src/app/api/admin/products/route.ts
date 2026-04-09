import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import {
  getAdminProductById,
  listAdminProducts,
  normalizeProductInput,
} from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET() {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  const products = await listAdminProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await getAdminApiSession();
  if (!session) return forbidden();

  try {
    const body = await req.json();
    const parsed = normalizeProductInput(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A product with that slug already exists." },
        { status: 409 }
      );
    }

    const created = await prisma.product.create({
      data: parsed.data,
    });
    const product = await getAdminProductById(created.id);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${created.slug}`);
    revalidatePath("/admin");

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[Admin] Create product failed:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
