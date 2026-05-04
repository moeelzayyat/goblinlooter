import { handleDiscordInteraction } from "@/lib/discord-support";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");
  let interaction: unknown;

  try {
    interaction = JSON.parse(rawBody || "{}");
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  return handleDiscordInteraction(
    interaction as Parameters<typeof handleDiscordInteraction>[0],
    rawBody,
    signature,
    timestamp
  );
}
