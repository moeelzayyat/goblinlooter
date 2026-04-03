"use client";

import { useState } from "react";
import Link from "next/link";
import { Gem } from "lucide-react";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
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
          <Button size="lg" type="submit" style={{ width: "100%" }}>
            Create Account
          </Button>
        </form>

        <p className={styles.toggle}>
          Already have an account?{" "}
          <Link href="/auth/login" className={styles.toggleLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
