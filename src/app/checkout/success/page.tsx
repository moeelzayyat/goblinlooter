import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { CheckoutSuccessClient } from "./CheckoutSuccessClient";
import styles from "./page.module.css";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <CheckoutSuccessClient
          orderId={typeof orderId === "string" ? orderId : null}
        />
      </main>
      <Footer />
    </div>
  );
}
