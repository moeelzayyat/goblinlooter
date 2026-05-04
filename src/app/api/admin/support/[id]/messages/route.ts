import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { getAdminSupportTicketById } from "@/lib/admin-dashboard";
import { mirrorAdminChatToDiscord } from "@/lib/discord-support";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminApiSession();
  if (!session?.user?.id) return forbidden();

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const message =
      typeof body.message === "string" && body.message.trim()
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message must be 2000 characters or fewer." },
        { status: 400 }
      );
    }

    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId: id,
          senderId: session.user.id,
          senderRole: "admin",
          body: message,
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: {
          status: existing.status === "open" ? "in_progress" : existing.status,
        },
      }),
    ]);

    const ticket = await getAdminSupportTicketById(id);
    await mirrorAdminChatToDiscord(id, message);

    revalidatePath("/admin");

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[Admin] Send support message failed:", error);
    return NextResponse.json(
      { error: "Failed to send support message." },
      { status: 500 }
    );
  }
}
