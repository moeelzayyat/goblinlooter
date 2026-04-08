"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
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

const CATEGORIES: {
  id: string;
  name: string;
  icon: LucideIcon;
  faqs: { q: string; a: string }[];
}[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: BookOpen,
    faqs: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button in the top right corner, enter your email and create a password. You'll receive a confirmation email to verify your account.",
      },
      {
        q: "Do I need an account to purchase?",
        a: "Yes, an account is required so you can access your purchased products in your order history at any time.",
      },
    ],
  },
  {
    id: "buying",
    name: "Buying & Payment",
    icon: ShoppingCart,
    faqs: [
      {
        q: "What payment methods are accepted?",
        a: "We accept Bitcoin (BTC) and Litecoin (LTC). Payments are processed through our self-hosted BTCPay Server - a non-custodial payment processor. No third party ever touches your funds.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes. BTCPay Server processes payments directly on the blockchain. We never have access to your private keys or wallet. All transactions are verified by the Bitcoin/Litecoin network.",
      },
    ],
  },
  {
    id: "delivery",
    name: "Delivery",
    icon: Zap,
    faqs: [
      {
        q: "How quickly will I receive my product?",
        a: "Most products are delivered within seconds of payment confirmation. Occasionally, an order may go through a brief security review, which typically resolves within a few minutes.",
      },
      {
        q: "What if my order is under review?",
        a: "Some orders go through a quick security check to protect both you and us. You'll see a status page while this happens, and we'll email you as soon as your product is ready.",
      },
      {
        q: "Where do I find my product key or download?",
        a: "After purchase, your key or download link appears on the confirmation page. You can also access it anytime from My Orders in your account.",
      },
      {
        q: "My key doesn't work. What should I do?",
        a: "Contact our support team immediately using the 'Get help with this order' button on your order detail page. We'll investigate and resolve the issue - usually with a replacement key.",
      },
    ],
  },
  {
    id: "refunds",
    name: "Refunds",
    icon: RefreshCw,
    faqs: [
      {
        q: "Can I get a refund?",
        a: "Refund eligibility varies by product and is clearly shown on each product page before purchase. Generally, unredeemed keys can be refunded within 72 hours.",
      },
      {
        q: "How do I request a refund?",
        a: "Go to My Orders, find the order, and click 'Contact Support'. Select 'I want a refund' and our team will review your request within 48 hours.",
      },
      {
        q: "How long does a refund take to process?",
        a: "Once approved, crypto refunds are processed within 24 hours to the wallet address you provide.",
      },
    ],
  },
  {
    id: "account",
    name: "Account & Security",
    icon: UserCog,
    faqs: [
      {
        q: "How do I reset my password?",
        a: "Go to the login page and click 'Forgot Password'. Enter your email and follow the instructions in the reset email.",
      },
      {
        q: "How do I change my email address?",
        a: "Go to Account Settings and update your email. You'll need to verify the new email address before the change takes effect.",
      },
    ],
  },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { data: session } = useSession();

  const filteredCategories = search
    ? CATEGORIES.map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (f) =>
            f.q.toLowerCase().includes(search.toLowerCase()) ||
            f.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.faqs.length > 0)
    : CATEGORIES;

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
        <PageHeader
          title="Help Center"
          subtitle="Find answers or reach out to our team"
        />

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search for help..."
          className=""
        />

        <div style={{ marginTop: "var(--space-xl)" }}>
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} style={{ marginBottom: "var(--space-xl)" }}>
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
                  {cat.name}
                </h2>
                {cat.faqs.map((faq) => {
                  const key = `${cat.id}-${faq.q}`;
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

        {/* Contact form */}
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
            Still need help?
          </h2>
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!subject.trim() || !message.trim() || submitting) return;
              setSubmitting(true);
              try {
                const res = await fetch("/api/support", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    subject: subject.trim(),
                    message: message.trim(),
                    type: "general",
                  }),
                });
                if (res.ok) {
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
              label="Subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
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
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
                Message sent! We'll get back to you within 24 hours.
              </p>
            ) : (
              <Button
                size="sm"
                style={{ alignSelf: "flex-start" }}
                loading={submitting}
                disabled={!subject.trim() || !message.trim() || !session?.user}
              >
                <Send size={14} /> Send Message
              </Button>
            )}
            {!session?.user && (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                Please log in to submit a support ticket.
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
