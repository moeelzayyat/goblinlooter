import { createPublicKey, verify } from "crypto";
import { prisma } from "@/lib/prisma";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const DISCORD_EPHEMERAL_FLAG = 1 << 6;
const DISCORD_TEXT_CHANNEL_TYPE = 0;

interface DiscordInteraction {
  type: number;
  data?: {
    name?: string;
    options?: { name: string; value?: unknown }[];
  };
  channel_id?: string;
  member?: {
    roles?: string[];
    user?: {
      id?: string;
      username?: string;
      global_name?: string | null;
    };
  };
  user?: {
    id?: string;
    username?: string;
    global_name?: string | null;
  };
}

interface DiscordChannel {
  id: string;
  name?: string;
}

type TicketWithCustomer = Awaited<ReturnType<typeof getTicketForDiscord>>;

function getDiscordConfig() {
  return {
    botToken: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    supportChannelId: process.env.DISCORD_SUPPORT_CHANNEL_ID,
    ticketCategoryId: process.env.DISCORD_TICKET_CATEGORY_ID,
    supportRoleId: process.env.DISCORD_SUPPORT_ROLE_ID,
    publicKey: process.env.DISCORD_PUBLIC_KEY,
  };
}

function discordHeaders() {
  const { botToken } = getDiscordConfig();
  if (!botToken) return null;

  return {
    Authorization: `Bot ${botToken}`,
    "Content-Type": "application/json",
  };
}

function isDiscordConfigured() {
  const { botToken, guildId } = getDiscordConfig();
  return Boolean(botToken && guildId);
}

function sanitizeChannelName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function getDiscordUser(interaction: DiscordInteraction) {
  return interaction.member?.user || interaction.user || {};
}

function getReplyMessage(interaction: DiscordInteraction) {
  const option = interaction.data?.options?.find((item) => item.name === "message");
  return typeof option?.value === "string" ? option.value.trim() : "";
}

async function discordFetch<T>(path: string, init: RequestInit) {
  const headers = discordHeaders();
  if (!headers) throw new Error("Discord bot token is not configured.");

  const response = await fetch(`${DISCORD_API_BASE}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data.message === "string"
        ? data.message
        : `Discord request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data as T;
}

async function getTicketForDiscord(ticketId: string) {
  return prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
}

async function createTicketChannel(ticket: NonNullable<TicketWithCustomer>) {
  const { guildId, ticketCategoryId } = getDiscordConfig();
  if (!guildId) throw new Error("Discord guild ID is not configured.");

  const shortId = ticket.id.slice(-6).toLowerCase();
  const customerName = sanitizeChannelName(ticket.customer.username || "customer");
  const channelName = `ticket-${customerName}-${shortId}`.slice(0, 100);
  const topic = [
    `GoblinLooter live chat ticket ${ticket.id}`,
    `Customer: ${ticket.customer.username} (${ticket.customer.email})`,
    "Use /reply message:<text> in this channel to answer the customer.",
  ].join("\n");

  const channel = await discordFetch<DiscordChannel>(`/guilds/${guildId}/channels`, {
    method: "POST",
    body: JSON.stringify({
      name: channelName,
      type: DISCORD_TEXT_CHANNEL_TYPE,
      topic: topic.slice(0, 1024),
      parent_id: ticketCategoryId || undefined,
    }),
  });

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { discordChannelId: channel.id },
  });

  return channel.id;
}

async function ensureDiscordTicketChannel(ticketId: string) {
  const ticket = await getTicketForDiscord(ticketId);
  if (!ticket) throw new Error("Support ticket not found.");
  if (ticket.discordChannelId) return ticket.discordChannelId;

  const channelId = await createTicketChannel(ticket);
  await sendDiscordMessage(channelId, [
    `New live chat ticket: ${ticket.subject}`,
    `Customer: ${ticket.customer.username} (${ticket.customer.email})`,
    `Website ticket ID: ${ticket.id}`,
    "",
    "Reply with `/reply message: your response` in this channel.",
  ].join("\n"));

  const { supportChannelId } = getDiscordConfig();
  if (supportChannelId && supportChannelId !== channelId) {
    await sendDiscordMessage(
      supportChannelId,
      `New website live chat ticket created: <#${channelId}>`
    );
  }

  return channelId;
}

export async function sendDiscordMessage(channelId: string, content: string) {
  return discordFetch(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: content.slice(0, 2000),
      allowed_mentions: { parse: [] },
    }),
  });
}

export async function mirrorCustomerChatToDiscord(ticketId: string, message: string) {
  if (!isDiscordConfigured()) return;

  try {
    const channelId = await ensureDiscordTicketChannel(ticketId);
    await sendDiscordMessage(channelId, `Customer:\n${message}`);
  } catch (error) {
    console.error("[Discord] Failed to mirror customer chat:", error);
  }
}

export async function mirrorAdminChatToDiscord(ticketId: string, message: string) {
  if (!isDiscordConfigured()) return;

  try {
    const channelId = await ensureDiscordTicketChannel(ticketId);
    await sendDiscordMessage(channelId, `Support reply from admin panel:\n${message}`);
  } catch (error) {
    console.error("[Discord] Failed to mirror admin chat:", error);
  }
}

export async function handleDiscordInteraction(
  interaction: DiscordInteraction,
  rawBody: string,
  signature: string | null,
  timestamp: string | null
) {
  if (!verifyDiscordInteraction(rawBody, signature, timestamp)) {
    return Response.json({ error: "Invalid request signature." }, { status: 401 });
  }

  if (interaction.type === 1) {
    return Response.json({ type: 1 });
  }

  if (interaction.type !== 2 || interaction.data?.name !== "reply") {
    return Response.json({
      type: 4,
      data: {
        content: "Unsupported Discord command.",
        flags: DISCORD_EPHEMERAL_FLAG,
      },
    });
  }

  const channelId = interaction.channel_id;
  if (!channelId) {
    return discordCommandResponse("Run this command inside a ticket channel.");
  }

  const { supportRoleId } = getDiscordConfig();
  if (
    supportRoleId &&
    !interaction.member?.roles?.includes(supportRoleId)
  ) {
    return discordCommandResponse("You do not have permission to reply to website chats.");
  }

  const message = getReplyMessage(interaction);
  if (!message) {
    return discordCommandResponse("Reply message is required.");
  }

  if (message.length > 2000) {
    return discordCommandResponse("Reply must be 2000 characters or fewer.");
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      discordChannelId: channelId,
      type: "live_chat",
      status: { in: ["open", "in_progress"] },
    },
    select: { id: true, status: true },
  });

  if (!ticket) {
    return discordCommandResponse("No open website chat is linked to this channel.");
  }

  const discordUser = getDiscordUser(interaction);
  const supportName =
    discordUser.global_name || discordUser.username || "Discord support";

  await prisma.$transaction([
    prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: discordUser.id ? `discord:${discordUser.id}` : null,
        senderRole: "admin",
        body: message,
      },
    }),
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: ticket.status === "open" ? "in_progress" : ticket.status,
      },
    }),
  ]);

  await sendDiscordMessage(channelId, `Support reply from ${supportName}:\n${message}`);

  return discordCommandResponse("Reply sent to the customer chat.");
}

function discordCommandResponse(content: string) {
  return Response.json({
    type: 4,
    data: {
      content,
      flags: DISCORD_EPHEMERAL_FLAG,
      allowed_mentions: { parse: [] },
    },
  });
}

function verifyDiscordInteraction(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
) {
  const { publicKey } = getDiscordConfig();
  if (!publicKey || !signature || !timestamp) return false;

  try {
    const rawPublicKey =
      publicKey.length === 64
        ? `302a300506032b6570032100${publicKey}`
        : publicKey;
    const key = createPublicKey({
      key: Buffer.from(rawPublicKey, "hex"),
      format: "der",
      type: "spki",
    });

    return verify(
      null,
      Buffer.from(`${timestamp}${rawBody}`),
      key,
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    console.error("[Discord] Signature verification failed:", error);
    return false;
  }
}
