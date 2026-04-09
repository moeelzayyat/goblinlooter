"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export function AdminAccessGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to unlock the admin panel.");
      }

      router.refresh();
    } catch (unlockError) {
      setError(
        unlockError instanceof Error
          ? unlockError.message
          : "Unable to unlock the admin panel."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.gateMain}>
        <section className={styles.gateCard}>
          <p className={styles.eyebrow}>Restricted Access</p>
          <h1 className={styles.title}>Unlock the admin panel</h1>
          <p className={styles.subtitle}>
            This area is hidden behind a separate admin username and password in
            addition to your site account.
          </p>

          {configured ? (
            <form className={styles.gateForm} onSubmit={unlock}>
              <label className={styles.field}>
                <span>Admin username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="Admin username"
                />
              </label>

              <label className={styles.field}>
                <span>Admin password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Admin password"
                />
              </label>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.gateActions}>
                <Button type="submit" loading={submitting}>
                  Unlock Admin Panel
                </Button>
                <Link href="/account">
                  <Button type="button" variant="secondary">
                    Back to Account
                  </Button>
                </Link>
              </div>
            </form>
          ) : (
            <div className={styles.gateNotice}>
              <div className={styles.error}>
                Admin panel credentials are not configured yet.
              </div>
              <p className={styles.subtitle}>
                Set `ADMIN_PANEL_USERNAME` and `ADMIN_PANEL_PASSWORD` in the
                server environment, then try again.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
