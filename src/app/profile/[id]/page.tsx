import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Tabs } from "@/components/ui/Tabs";
import { ContentGrid } from "@/components/layout/ContentGrid";
import { ProductCard } from "@/components/data/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { MOCK_USERS, MOCK_PRODUCTS, MOCK_REVIEWS } from "@/lib/mockData";
import { Star, User, Clock, Shield, AlertTriangle, BarChart3 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const user = MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[0];
  const userProducts = MOCK_PRODUCTS.filter((p) => p.seller.id === user.id);

  const reviewsTab = (
    <div>
      {MOCK_REVIEWS.length > 0 ? (
        MOCK_REVIEWS.map((r) => (
          <div key={r.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "var(--space-lg)", marginBottom: "var(--space-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-sm)" }}>
              <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{r.reviewer.username}</span>
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={12} fill={i < r.rating ? "var(--warning)" : "transparent"} color={i < r.rating ? "var(--warning)" : "var(--text-muted)"} />
                ))}
              </div>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.text}</p>
          </div>
        ))
      ) : (
        <EmptyState message="No reviews yet" />
      )}
    </div>
  );

  const listingsTab = userProducts.length > 0 ? (
    <ContentGrid columns={3}>
      {userProducts.map((p) => <ProductCard key={p.id} product={p} />)}
    </ContentGrid>
  ) : (
    <EmptyState message="No active listings" />
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main style={{ flex: 1, maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-xl) var(--space-lg)", width: "100%" }}>
        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)", marginBottom: "var(--space-xl)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <User size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-xs)" }}>{user.username}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", flexWrap: "wrap" }}>
              <span>Member since {user.memberSince}</span>
              <VerificationBadge tier={user.verificationTier} />
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Star size={14} fill="var(--warning)" color="var(--warning)" />
                {user.rating} ({user.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-md)", marginBottom: "var(--space-xl)", padding: "var(--space-lg)", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
          {[
            { icon: BarChart3, value: user.tradesCompleted, label: "Trades" },
            { icon: Shield, value: user.itemsSold, label: "Items Sold" },
            { icon: Clock, value: user.responseTime, label: "Response Time" },
            { icon: AlertTriangle, value: `${user.disputeRate}%`, label: "Dispute Rate" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <Tabs
          tabs={[
            { id: "reviews", label: "Reviews", content: reviewsTab },
            { id: "listings", label: "Active Listings", content: listingsTab },
            { id: "history", label: "Trade History", content: <EmptyState message="No trade history to show" /> },
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
