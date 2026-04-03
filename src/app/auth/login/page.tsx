"use client";

import { useState } from "react";
import Link from "next/link";
import { Gem } from "lucide-react";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <Gem size={24} className={styles.logoIcon} />
          GoblinLooter
        </Link>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
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
            required
          />
          <Button size="lg" type="submit" style={{ width: "100%" }}>
            Sign In
          </Button>
        </form>

        <p className={styles.toggle}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className={styles.toggleLink}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
