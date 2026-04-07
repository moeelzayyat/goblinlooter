import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { CheckCircle, ArrowRight, ShoppingCart } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-3xl) var(--space-lg)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-lg)",
          }}
        >
          <CheckCircle
            size={64}
            style={{ color: "var(--accent)" }}
            strokeWidth={1.5}
          />
          <h1
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Payment Received!
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: "var(--line-height-normal)",
            }}
          >
            Thank you for your purchase! Your license key will be delivered to
            your email shortly. If you don&apos;t receive it within 15 minutes,
            please contact our support team.
          </p>
          <div style={{ display: "flex", gap: "var(--space-md)" }}>
            <Link href="/">
              <Button variant="secondary">
                <ArrowRight size={16} />
                Back to Home
              </Button>
            </Link>
            <Link href="/support">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
