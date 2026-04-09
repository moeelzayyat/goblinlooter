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
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./NavBar.module.css";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/support", label: "Support" },
];

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userLabel = session?.user?.name || session?.user?.email || "Account";
  const isAdmin = session?.user?.role === "admin";

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
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={styles.menuItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
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
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="secondary"
                    size="lg"
                    style={{ width: "100%" }}
                  >
                    Admin Panel
                  </Button>
                </Link>
              )}
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
