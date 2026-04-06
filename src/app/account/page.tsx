"use client";

import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main
        style={{
          flex: 1,
          maxWidth: 640,
          margin: "0 auto",
          padding: "var(--space-xl) var(--space-lg)",
          width: "100%",
        }}
      >
        <PageHeader title="Account Settings" />

        {/* Account Info */}
        <section style={{ marginBottom: "var(--space-2xl)" }}>
          <h2
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Account Info
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            <TextInput label="Username" defaultValue="" />
            <TextInput label="Email" type="email" defaultValue="" />
            <Button
              variant="primary"
              size="sm"
              style={{ alignSelf: "flex-start" }}
            >
              Save Changes
            </Button>
          </div>
        </section>

        {/* Password */}
        <section
          style={{
            marginBottom: "var(--space-2xl)",
            paddingTop: "var(--space-xl)",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Password & Security
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            <TextInput
              label="Current Password"
              type="password"
              placeholder="••••••••"
            />
            <TextInput
              label="New Password"
              type="password"
              placeholder="••••••••"
            />
            <TextInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
            />
            <Button
              variant="primary"
              size="sm"
              style={{ alignSelf: "flex-start" }}
            >
              Update Password
            </Button>
          </div>
        </section>

        {/* Payment */}
        <section
          style={{
            marginBottom: "var(--space-2xl)",
            paddingTop: "var(--space-xl)",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Payment Methods
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
            }}
          >
            No payment methods added yet.
          </p>
          <Button
            variant="secondary"
            size="sm"
            style={{ marginTop: "var(--space-md)" }}
          >
            Add Payment Method
          </Button>
        </section>

        {/* Notifications */}
        <section
          style={{
            paddingTop: "var(--space-xl)",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 600,
              marginBottom: "var(--space-lg)",
            }}
          >
            Notifications
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            {["Order updates", "Delivery confirmations", "Promotional emails", "Security alerts"].map(
              (n) => (
                <label
                  key={n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    defaultChecked={n !== "Promotional emails"}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  {n}
                </label>
              )
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
