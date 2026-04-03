"use client";

import { useState } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { ConfirmModal } from "@/components/feedback/ConfirmModal";
import { MOCK_USERS } from "@/lib/mockData";
import { Star, CheckCircle2, Clock, X } from "lucide-react";
import styles from "./page.module.css";

const YOUR_ITEMS = [
  { name: "Legendary Dragon Blade", value: 45 },
  { name: "Health Potion x10", value: 5 },
];
const THEIR_ITEMS = [
  { name: "Enchanted Shield of Fortitude", value: 52 },
];

export default function TradeRoomPage() {
  const partner = MOCK_USERS[1];
  const [yourConfirmed, setYourConfirmed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const yourTotal = YOUR_ITEMS.reduce((s, i) => s + i.value, 0);
  const theirTotal = THEIR_ITEMS.reduce((s, i) => s + i.value, 0);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-lg)" }}>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>Trade Room</h1>
          <Button variant="ghost" size="sm" onClick={() => setShowCancel(true)}>
            <X size={16} /> Cancel Trade
          </Button>
        </div>

        {/* Partner info */}
        <div className={styles.partnerInfo}>
          <span className={styles.partnerName}>Trading with {partner.username}</span>
          <div className={styles.partnerMeta}>
            <Star size={12} fill="var(--warning)" color="var(--warning)" />
            {partner.rating}
            <VerificationBadge tier={partner.verificationTier} showLabel={false} />
          </div>
        </div>

        {/* Trade panels */}
        <div className={styles.panels}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Your Offer</div>
            <div className={styles.itemList}>
              {YOUR_ITEMS.map((item) => (
                <div key={item.name} className={styles.tradeItem}>
                  <span className={styles.tradeItemName}>{item.name}</span>
                  <span className={styles.tradeItemValue}>${item.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total value</span>
              <span className={styles.totalValue}>~${yourTotal}</span>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Their Offer</div>
            <div className={styles.itemList}>
              {THEIR_ITEMS.map((item) => (
                <div key={item.name} className={styles.tradeItem}>
                  <span className={styles.tradeItemName}>{item.name}</span>
                  <span className={styles.tradeItemValue}>${item.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total value</span>
              <span className={styles.totalValue}>~${theirTotal}</span>
            </div>
          </div>
        </div>

        {/* Status & confirmation */}
        <div className={styles.statusBar}>
          <span className={styles.statusText}>
            Waiting for both parties to confirm
          </span>
          <div className={styles.statusActions}>
            <div className={styles.confirmState}>
              {yourConfirmed ? (
                <><CheckCircle2 size={16} color="var(--accent)" /> <span className={styles.confirmed}>You confirmed</span></>
              ) : (
                <Button size="sm" onClick={() => setShowConfirm(true)}>Confirm Trade</Button>
              )}
            </div>
            <div className={styles.confirmState}>
              <Clock size={16} color="var(--text-muted)" />
              <span className={styles.waiting}>Awaiting partner</span>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className={styles.chatSection}>
          <div className={styles.chatHeader}>Chat</div>
          <div className={styles.chatMessages}>
            <div className={styles.chatMsg}>
              <span className={styles.chatSender}>{partner.username}: </span>
              Hey, ready to trade whenever you are!
            </div>
            <div className={styles.chatMsg}>
              <span className={styles.chatSender}>You: </span>
              Looks good. Confirming now.
            </div>
          </div>
          <div className={styles.chatInput}>
            <input className={styles.chatField} placeholder="Type a message..." />
            <button className={styles.chatSend}>Send</button>
          </div>
        </div>
      </main>
      <Footer />

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setYourConfirmed(true); setShowConfirm(false); }}
        title="Confirm Trade"
        description={`You are trading ${YOUR_ITEMS.length} item(s) valued at ~$${yourTotal} for ${THEIR_ITEMS.length} item(s) valued at ~$${theirTotal}.`}
        warning="This action cannot be undone after both parties confirm. A 10-second countdown will begin once your partner also confirms."
        confirmLabel="Confirm Trade"
      />

      <ConfirmModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => setShowCancel(false)}
        title="Cancel Trade"
        description="Are you sure? This trade will be discarded."
        confirmLabel="Cancel Trade"
        confirmVariant="danger"
      />
    </div>
  );
}
