"use client";

import { useState } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import {
  BookOpen,
  ShoppingCart,
  Store,
  ArrowLeftRight,
  UserCog,
  Shield,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORIES: { id: string; name: string; icon: LucideIcon; faqs: { q: string; a: string }[] }[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: BookOpen,
    faqs: [
      { q: "How do I create an account?", a: "Click the 'Sign Up' button in the top right corner, enter your email and create a password. You'll receive a confirmation email to verify your account." },
      { q: "Is GoblinLooter free to use?", a: "Creating an account and browsing is free. Sellers pay a small commission on each sale. Buyers pay the listed price with no additional fees." },
    ],
  },
  {
    id: "buying",
    name: "Buying",
    icon: ShoppingCart,
    faqs: [
      { q: "How does payment protection work?", a: "All payments are held in escrow until you confirm delivery. If there's an issue, you can open a dispute within 72 hours." },
      { q: "What payment methods are accepted?", a: "We accept major credit cards, PayPal, and cryptocurrency. All transactions are processed securely." },
    ],
  },
  {
    id: "selling",
    name: "Selling",
    icon: Store,
    faqs: [
      { q: "How do I list an item?", a: "Go to your Dashboard, click 'New Listing', fill in the details, set your price, and publish. Your listing will be live immediately." },
      { q: "What are the seller fees?", a: "Sellers pay a 5% commission on each completed sale. There are no listing fees or monthly subscriptions." },
    ],
  },
  {
    id: "trading",
    name: "Trading",
    icon: ArrowLeftRight,
    faqs: [
      { q: "How does the trade system work?", a: "Create a trade listing with what you're offering and what you want. Other users can view and accept your offer. Both parties must confirm before the trade executes." },
      { q: "Is trading safe?", a: "Yes. Both parties must confirm the trade, and there's a 10-second countdown before execution. You can cancel at any time before the countdown ends." },
    ],
  },
  {
    id: "account",
    name: "Account & Security",
    icon: UserCog,
    faqs: [
      { q: "How do I get verified?", a: "Go to Settings → verify your email, then upload a government-issued ID. Verification typically takes 24–48 hours." },
      { q: "What is the Trusted Seller badge?", a: "Trusted Seller status is awarded to verified sellers with 50+ completed trades, a 4.5+ rating, and zero disputes." },
    ],
  },
  {
    id: "disputes",
    name: "Disputes",
    icon: Shield,
    faqs: [
      { q: "How do I file a dispute?", a: "Go to your trade/order history, find the transaction, and click 'Dispute'. Describe the issue, attach evidence, and submit. Our team will review within 48 hours." },
      { q: "What happens during a dispute?", a: "Funds are held until resolution. Both parties can submit evidence. Our team makes a final decision and resolves the dispute." },
    ],
  },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

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
      <main style={{ flex: 1, maxWidth: 800, margin: "0 auto", padding: "var(--space-xl) var(--space-lg)", width: "100%" }}>
        <PageHeader title="Help Center" subtitle="Find answers or reach out to our team" />

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
                <h2 style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", fontSize: "var(--text-md)", fontWeight: 600, marginBottom: "var(--space-md)" }}>
                  <Icon size={18} color="var(--text-muted)" />
                  {cat.name}
                </h2>
                {cat.faqs.map((faq) => {
                  const key = `${cat.id}-${faq.q}`;
                  const isOpen = openFaq === key;
                  return (
                    <div
                      key={key}
                      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", marginBottom: "var(--space-sm)", overflow: "hidden" }}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                        style={{ width: "100%", padding: "var(--space-md) var(--space-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-base)", fontWeight: 500, color: "var(--text-primary)", textAlign: "left" }}
                      >
                        {faq.q}
                        {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: "0 var(--space-lg) var(--space-lg)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
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
        <div style={{ marginTop: "var(--space-2xl)", padding: "var(--space-xl)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, marginBottom: "var(--space-lg)" }}>Still need help?</h2>
          <form style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }} onSubmit={(e) => e.preventDefault()}>
            <TextInput label="Subject" placeholder="Brief description of your issue" />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)" }}>Message</label>
              <textarea
                rows={4}
                placeholder="Describe your issue in detail..."
                style={{ width: "100%", padding: "10px var(--space-md)", fontSize: "var(--text-base)", color: "var(--text-primary)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
            <Button size="sm" style={{ alignSelf: "flex-start" }}>
              <Send size={14} /> Send Message
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
