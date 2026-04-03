import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { MOCK_TRADE_LISTINGS } from "@/lib/mockData";
import { ArrowRight, Package, Star } from "lucide-react";
import styles from "./page.module.css";

export default function TradingPage() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <PageHeader
          title="Trade Listings"
          subtitle="Browse active trade offers from the community"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {MOCK_TRADE_LISTINGS.map((listing) => (
            <Link
              key={listing.id}
              href={`/trading/${listing.id}`}
              className={styles.listingCard}
            >
              <div className={styles.itemThumb}>
                <Package size={24} />
              </div>

              <div className={styles.listingBody}>
                <span className={styles.listingTitle}>
                  {listing.offeredItem.name}
                </span>
                <div className={styles.listingMeta}>
                  <span className={styles.listingArrow}>
                    wants <ArrowRight size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                  </span>
                  {listing.wantedItem ? (
                    <span className={styles.listingWanted}>
                      {listing.wantedItem.name}
                    </span>
                  ) : (
                    <span className={styles.openOffers}>Open to offers</span>
                  )}
                </div>
                <div className={styles.listingMeta}>
                  <span>{listing.trader.username}</span>
                  <Star size={12} fill="var(--warning)" color="var(--warning)" />
                  <span>{listing.trader.rating}</span>
                  <VerificationBadge
                    tier={listing.trader.verificationTier}
                    showLabel={false}
                  />
                  <span style={{ color: "var(--text-muted)" }}>
                    {listing.game}
                  </span>
                </div>
              </div>

              <div className={styles.listingRight}>
                <span className={styles.listingValue}>
                  ~${listing.offeredItem.estimatedValue}
                </span>
                <span className={styles.viewLink}>View Trade →</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
