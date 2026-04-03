"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./NavBar.module.css";

const NAV_LINKS = [
  { href: "/browse", label: "Marketplace" },
  { href: "/trading", label: "Trading" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/support", label: "Support" },
];

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Gem size={24} className={styles.logoIcon} />
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
          <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
            <Button variant="secondary" size="lg" style={{ width: "100%" }}>
              Log In
            </Button>
          </Link>
          <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
            <Button variant="primary" size="lg" style={{ width: "100%" }}>
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
