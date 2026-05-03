"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./NavBar.module.css";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/support", label: "Support" },
];

const DISCORD_URL = "https://discord.gg/arcway";

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      focusable="false"
    >
      <path d="M20.32 4.37A18.18 18.18 0 0 0 15.83 3c-.2.36-.42.85-.58 1.23a16.9 16.9 0 0 0-5.01 0A12.4 12.4 0 0 0 9.65 3a18.27 18.27 0 0 0-4.5 1.38C2.3 8.68 1.53 12.87 1.92 17a18.32 18.32 0 0 0 5.52 2.8c.44-.6.84-1.24 1.18-1.92-.65-.24-1.27-.54-1.86-.9.16-.12.31-.24.46-.37a13.04 13.04 0 0 0 11.06 0l.46.37c-.59.36-1.21.66-1.86.9.34.68.74 1.32 1.18 1.92A18.27 18.27 0 0 0 23.58 17c.47-4.79-.8-8.94-3.26-12.63ZM8.47 14.45c-1.08 0-1.96-.99-1.96-2.2 0-1.22.86-2.21 1.96-2.21s1.98 1 1.96 2.2c0 1.22-.86 2.21-1.96 2.21Zm7.06 0c-1.08 0-1.96-.99-1.96-2.2 0-1.22.86-2.21 1.96-2.21s1.98 1 1.96 2.2c0 1.22-.86 2.21-1.96 2.21Z" />
    </svg>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userLabel = session?.user?.name || session?.user?.email || "Account";

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="GoblinLooter"
            width={32}
            height={32}
            style={{ borderRadius: "6px" }}
          />
          GoblinLooter
        </Link>

        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? styles.linkActive
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={DISCORD_URL}
            className={styles.discordLink}
            target="_blank"
            rel="noreferrer"
            aria-label="Join Discord"
          >
            <DiscordIcon />
            <span>Discord</span>
          </a>
        </div>

        <div className={styles.actions}>
          {session?.user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={styles.userBtn}
              >
                <div className={styles.userAvatar}>
                  <User size={16} />
                </div>
                <span className={styles.userName}>{userLabel}</span>
              </button>

              {userMenuOpen && (
                <div className={styles.userMenu}>
                  <Link
                    href="/orders"
                    className={styles.menuItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ShoppingBag size={16} /> My Orders
                  </Link>
                  <Link
                    href="/account"
                    className={styles.menuItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={16} /> Account Settings
                  </Link>
                  <button
                    className={styles.menuItem}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <a
          href={DISCORD_URL}
          className={styles.mobileDiscordLink}
          target="_blank"
          rel="noreferrer"
          onClick={() => setMobileOpen(false)}
        >
          <DiscordIcon />
          <span>Discord</span>
        </a>
        <div className={styles.mobileActions}>
          {session?.user ? (
            <>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  padding: "var(--space-sm) 0",
                }}
              >
                Signed in as {userLabel}
              </span>
              <Link href="/orders" onClick={() => setMobileOpen(false)}>
                <Button
                  variant="secondary"
                  size="lg"
                  style={{ width: "100%" }}
                >
                  My Orders
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                style={{ width: "100%" }}
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button
                  variant="secondary"
                  size="lg"
                  style={{ width: "100%" }}
                >
                  Log In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                <Button
                  variant="primary"
                  size="lg"
                  style={{ width: "100%" }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
