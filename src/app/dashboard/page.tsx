import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContentGrid } from "@/components/layout/ContentGrid";
import { StatCard } from "@/components/data/StatCard";
import { StatusChip } from "@/components/trust/StatusChip";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { Package, ShoppingCart, DollarSign, Star, Plus, Eye, Pencil, Pause } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const listingsTable = (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
            {["Item", "Price", "Views", "Status", "Actions"].map((h) => (
              <th key={h} style={{ padding: "var(--space-md)", textAlign: "left", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_PRODUCTS.slice(0, 4).map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "var(--space-md)", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)" }}>{p.title}</td>
              <td style={{ padding: "var(--space-md)", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--warning)", fontSize: "var(--text-sm)" }}>${p.price.toFixed(2)}</td>
              <td style={{ padding: "var(--space-md)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}><Eye size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {Math.floor(Math.random() * 500 + 50)}</td>
              <td style={{ padding: "var(--space-md)" }}><StatusChip status="active" /></td>
              <td style={{ padding: "var(--space-md)", display: "flex", gap: "var(--space-sm)" }}>
                <Button variant="ghost" size="sm"><Pencil size={14} /></Button>
                <Button variant="ghost" size="sm"><Pause size={14} /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const pendingTab = (
    <div style={{ padding: "var(--space-2xl)", textAlign: "center", color: "var(--text-muted)" }}>
      No pending orders right now.
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main style={{ flex: 1, maxWidth: "var(--max-width)", margin: "0 auto", padding: "var(--space-xl) var(--space-lg)", width: "100%" }}>
        <PageHeader
          title="Seller Dashboard"
          action={
            <Button size="sm">
              <Plus size={16} /> New Listing
            </Button>
          }
        />

        <ContentGrid columns={4}>
          <StatCard icon={Package} value="4" label="Active Listings" />
          <StatCard icon={ShoppingCart} value="0" label="Pending Orders" />
          <StatCard icon={DollarSign} value="$312.50" label="Revenue (30d)" />
          <StatCard icon={Star} value="4.8" label="Average Rating" />
        </ContentGrid>

        <div style={{ marginTop: "var(--space-xl)" }}>
          <Tabs
            tabs={[
              { id: "listings", label: "Active Listings", content: listingsTable },
              { id: "pending", label: "Pending", content: pendingTab },
              { id: "completed", label: "Completed", content: pendingTab },
              { id: "analytics", label: "Analytics", content: (
                <div style={{ padding: "var(--space-2xl)", textAlign: "center", color: "var(--text-muted)" }}>
                  Analytics coming soon.
                </div>
              )},
            ]}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
