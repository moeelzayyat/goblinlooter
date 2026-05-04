import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function serializeTicket(
  ticket: Awaited<ReturnType<typeof getActiveChatTicket>>
) {
  if (!ticket) return null;

  return {
    id: ticket.id,
    status: ticket.status,
    subject: ticket.subject,
    updatedAt: ticket.updatedAt.toISOString(),
    messages: ticket.messages.map((message) => ({
      id: message.id,
      senderRole: message.senderRole,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

async function getActiveChatTicket(customerId: string) {
  return prisma.supportTicket.findFirst({
    where: {
      customerId,
      type: "live_chat",
      status: { in: ["open", "in_progress"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticket = await getActiveChatTicket(session.user.id);
  return NextResponse.json({ ticket: serializeTicket(ticket) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  let ticket = await getActiveChatTicket(session.user.id);

  if (!ticket) {
    await prisma.supportTicket.create({
      data: {
        customerId: session.user.id,
        subject: "Live chat",
        message,
        type: "live_chat",
        status: "open",
        messages: {
          create: {
            senderId: session.user.id,
            senderRole: "customer",
            body: message,
          },
        },
      },
    });
  } else {
    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: session.user.id,
          senderRole: "customer",
          body: message,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: ticket.status === "in_progress" ? "in_progress" : "open",
        },
      }),
    ]);
  }

  ticket = await getActiveChatTicket(session.user.id);
  return NextResponse.json({ ticket: serializeTicket(ticket) });
}
