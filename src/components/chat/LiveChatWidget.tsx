"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle, Send, X } from "lucide-react";
import styles from "./LiveChatWidget.module.css";

interface ChatMessage {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

interface ChatTicket {
  id: string;
  status: string;
  messages: ChatMessage[];
}

export function LiveChatWidget() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState<ChatTicket | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageCount = ticket?.messages.length || 0;

  const scrollToLatestMessage = useCallback((behavior: ScrollBehavior = "smooth") => {
    window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        block: "end",
        behavior,
      });
    });
  }, []);

  const loadChat = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load chat.");
      }

      setTicket(data.ticket || null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load chat.");
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (open && session?.user) {
      loadChat();
    }
  }, [loadChat, open, session?.user]);

  useEffect(() => {
    if (!open || !session?.user) return;

    const interval = window.setInterval(() => {
      loadChat();
    }, 8000);

    return () => window.clearInterval(interval);
  }, [loadChat, open, session?.user]);

  useEffect(() => {
    if (!open || !session?.user) return;

    scrollToLatestMessage();
  }, [messageCount, open, scrollToLatestMessage, session?.user]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = message.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send message.");
      }

      setTicket(data.ticket || null);
      setMessage("");
      scrollToLatestMessage();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.root}>
      {open ? (
        <section className={styles.panel} aria-label="Live chat">
          <div className={styles.header}>
            <div>
              <strong>Live Chat</strong>
              <span>{session?.user ? "Support usually replies here." : "Log in to chat."}</span>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setOpen(false)}
              aria-label="Close live chat"
            >
              <X size={18} />
            </button>
          </div>

          {status === "loading" || loading ? (
            <div className={styles.state}>Loading chat...</div>
          ) : !session?.user ? (
            <div className={styles.state}>
              <p>Please log in to start a support chat.</p>
              <Link href="/auth/login">Log in</Link>
            </div>
          ) : (
            <>
              <div className={styles.messages}>
                {ticket?.messages.length ? (
                  ticket.messages.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.message} ${
                        item.senderRole === "admin" ? styles.adminMessage : ""
                      }`}
                    >
                      <span>{item.senderRole === "admin" ? "Support" : "You"}</span>
                      <p>{item.body}</p>
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>
                    Send a message and the support team can reply from the admin panel.
                  </div>
                )}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>

              {error ? <div className={styles.error}>{error}</div> : null}

              <form className={styles.form} onSubmit={sendMessage}>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  maxLength={2000}
                />
                <button type="submit" disabled={!message.trim() || sending}>
                  <Send size={16} />
                  <span>{sending ? "Sending" : "Send"}</span>
                </button>
              </form>
            </>
          )}
        </section>
      ) : null}

      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen((current) => !current)}
        aria-label="Open live chat"
      >
        <MessageCircle size={22} />
        <span>Chat</span>
      </button>
    </div>
  );
}
