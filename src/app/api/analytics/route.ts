import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, userId, sessionId } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid event" },
        { status: 400 }
      );
    }

    await prisma.analyticsEvent.create({
      data: {
        event,
        data: data ?? undefined,
        userId: userId ?? null,
        sessionId: sessionId ?? null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to log event" },
      { status: 500 }
    );
  }
}
