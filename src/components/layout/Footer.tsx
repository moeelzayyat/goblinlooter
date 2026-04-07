import Link from "next/link";
import Image from "next/image";
import { Globe, MessageCircle, ExternalLink } from "lucide-react";
import styles from "./Footer.module.css";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "ArcWay Dupe", href: "/shop/arcway-dupe" },
      { label: "Browse All", href: "/shop" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Contact Us", href: "/support#contact" },
      { label: "Refund Policy", href: "/refund-policy" },
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
              <Image
                src="/logo.png"
                alt="GoblinLooter"
                width={20}
                height={20}
                style={{ borderRadius: "4px" }}
              />
              GoblinLooter
            </div>
            <p className={styles.tagline}>
              Premium digital game tools — curated, tested, delivered fast.
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
            <a href="#" className={styles.socialLink} aria-label="Website">
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
