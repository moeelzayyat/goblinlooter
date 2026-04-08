import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, type, orderId } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const validTypes = [
      "refund_request",
      "delivery_issue",
      "key_problem",
      "general",
    ];
    const ticketType = validTypes.includes(type) ? type : "general";

    const ticket = await prisma.supportTicket.create({
      data: {
        customerId: session.user.id!,
        subject: subject.trim(),
        message: message.trim(),
        type: ticketType,
        orderId: orderId || null,
        status: "open",
      },
    });

    console.log(
      `[Support] New ticket ${ticket.id} from ${session.user.email}: ${subject}`
    );

    return NextResponse.json({
      ticketId: ticket.id,
      status: ticket.status,
    });
  } catch (error) {
    console.error("Support ticket error:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
