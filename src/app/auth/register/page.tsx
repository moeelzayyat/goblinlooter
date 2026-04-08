"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Gem } from "lucide-react";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackParam = searchParams.get("callbackUrl");
  const callbackUrl =
    callbackParam && callbackParam.startsWith("/") ? callbackParam : "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push(
          callbackUrl === "/"
            ? "/auth/login"
            : `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        );
      } else {
        router.push(signInResult?.url || callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <Gem size={24} className={styles.logoIcon} />
          GoblinLooter
        </Link>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            placeholder="goblinmaster42"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Must be at least 8 characters"
            required
          />
          <Button
            size="lg"
            type="submit"
            loading={loading}
            style={{ width: "100%" }}
          >
            Create Account
          </Button>
        </form>

        <p className={styles.toggle}>
          Already have an account?{" "}
          <Link
            href={
              callbackUrl === "/"
                ? "/auth/login"
                : `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            }
            className={styles.toggleLink}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
