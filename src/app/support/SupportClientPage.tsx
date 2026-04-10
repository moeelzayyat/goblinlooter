"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  ShoppingCart,
  Zap,
  RefreshCw,
  UserCog,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import type {
  SupportCategoryIcon,
  SupportSettings,
} from "@/lib/site-settings-schema";

const SUPPORT_ICON_MAP: Record<SupportCategoryIcon, LucideIcon> = {
  "book-open": BookOpen,
  "shopping-cart": ShoppingCart,
  zap: Zap,
  "refresh-cw": RefreshCw,
  "user-cog": UserCog,
};

export function SupportClientPage({
  initialSettings,
}: {
  initialSettings: SupportSettings;
}) {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { data: session } = useSession();

  const filteredCategories = search
    ? initialSettings.categories
        .map((category) => ({
          ...category,
          faqs: category.faqs.filter(
            (faq) =>
              faq.q.toLowerCase().includes(search.toLowerCase()) ||
              faq.a.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((category) => category.faqs.length > 0)
    : initialSettings.categories;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main
        style={{
          flex: 1,
          maxWidth: 800,
          margin: "0 auto",
          padding: "var(--space-xl) var(--space-lg)",
          width: "100%",
        }}
      >
        <PageHeader title={initialSettings.title} subtitle={initialSettings.subtitle} />

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={initialSettings.searchPlaceholder}
          className=""
        />

        <div style={{ marginTop: "var(--space-xl)" }}>
          {filteredCategories.map((category) => {
            const Icon = SUPPORT_ICON_MAP[category.icon];
            return (
              <div key={category.id} style={{ marginBottom: "var(--space-xl)" }}>
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-sm)",
                    fontSize: "var(--text-md)",
                    fontWeight: 600,
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <Icon size={18} color="var(--text-muted)" />
                  {category.name}
                </h2>
                {category.faqs.map((faq) => {
                  const key = `${category.id}-${faq.q}`;
                  const isOpen = openFaq === key;

                  return (
                    <div
                      key={key}
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                        marginBottom: "var(--space-sm)",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        style={{
                          width: "100%",
                          padding: "var(--space-md) var(--space-lg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "var(--text-base)",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          textAlign: "left",
                        }}
                      >
                        {faq.q}
                        {isOpen ? (
                          <ChevronUp size={16} color="var(--text-muted)" />
                        ) : (
                          <ChevronDown size={16} color="var(--text-muted)" />
                        )}
                      </button>
                      {isOpen && (
                        <div
                          style={{
                            padding: "0 var(--space-lg) var(--space-lg)",
                            fontSize: "var(--text-sm)",
                            color: "var(--text-secondary)",
                            lineHeight: 1.7,
                          }}
                        >
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div
          id="contact"
          style={{
            marginTop: "var(--space-2xl)",
            padding: "var(--space-xl)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            {initialSettings.contactTitle}
          </h2>
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
            onSubmit={async (event) => {
              event.preventDefault();
              if (!subject.trim() || !message.trim() || submitting) return;

              setSubmitting(true);
              try {
                const response = await fetch("/api/support", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    subject: subject.trim(),
                    message: message.trim(),
                    type: "general",
                  }),
                });

                if (response.ok) {
                  setSubmitted(true);
                  setSubject("");
                  setMessage("");
                } else {
                  alert("Failed to send. Please try again.");
                }
              } catch {
                alert("Something went wrong. Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <TextInput
              label={initialSettings.contactSubjectLabel}
              placeholder={initialSettings.contactSubjectPlaceholder}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-xs)",
              }}
            >
              <label
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                {initialSettings.contactMessageLabel}
              </label>
              <textarea
                rows={4}
                placeholder={initialSettings.contactMessagePlaceholder}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                style={{
                  width: "100%",
                  padding: "10px var(--space-md)",
                  fontSize: "var(--text-base)",
                  color: "var(--text-primary)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
            {submitted ? (
              <p
                style={{
                  color: "var(--accent)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                }}
              >
                {initialSettings.contactSuccessMessage}
              </p>
            ) : (
              <Button
                size="sm"
                style={{ alignSelf: "flex-start" }}
                loading={submitting}
                disabled={!subject.trim() || !message.trim() || !session?.user}
              >
                <Send size={14} /> {initialSettings.contactSubmitLabel}
              </Button>
            )}
            {!session?.user && (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                {initialSettings.contactLoggedOutHint}
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
