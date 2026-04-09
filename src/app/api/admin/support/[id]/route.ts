import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import {
  getAdminSupportTicketById,
  normalizeAdminTicketUpdate,
} from "@/lib/admin-dashboard";
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
    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = normalizeAdminTicketUpdate(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await prisma.supportTicket.update({
      where: { id },
      data: parsed.data,
    });

    const ticket = await getAdminSupportTicketById(id);

    revalidatePath("/admin");
    revalidatePath("/support");

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[Admin] Update ticket failed:", error);
    return NextResponse.json(
      { error: "Failed to update ticket." },
      { status: 500 }
    );
  }
}
