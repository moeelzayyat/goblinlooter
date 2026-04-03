import Link from "next/link";
import { Gem, Globe, MessageCircle, ExternalLink } from "lucide-react";
import styles from "./Footer.module.css";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse All", href: "/browse" },
      { label: "Game Tools", href: "/browse?category=game-tools" },
      { label: "Scripts", href: "/browse?category=scripts" },
      { label: "Configs", href: "/browse?category=configs" },
    ],
  },
  {
    title: "Trading",
    links: [
      { label: "Trade Listings", href: "/trading" },
      { label: "How Trading Works", href: "/support#trading" },
      { label: "Safety Tips", href: "/support#safety" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Contact Us", href: "/support#contact" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <Gem size={20} className={styles.logoIcon} />
              GoblinLooter
            </div>
            <p className={styles.tagline}>
              Buy, sell, and trade game tools with verified sellers and secure
              transactions.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className={styles.column}>
              <span className={styles.columnTitle}>{col.title}</span>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.columnLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} GoblinLooter. All rights reserved.
          </span>
          <div className={styles.socials}>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <Globe size={18} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Discord">
              <MessageCircle size={18} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="GitHub">
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
