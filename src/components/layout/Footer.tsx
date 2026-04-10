"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, MessageCircle, ExternalLink } from "lucide-react";
import {
  DEFAULT_SITE_SETTINGS,
  type FooterSettings,
  type FooterSocialIcon,
} from "@/lib/site-settings-schema";
import styles from "./Footer.module.css";

const FOOTER_ICON_MAP: Record<FooterSocialIcon, typeof Globe> = {
  globe: Globe,
  "message-circle": MessageCircle,
  "external-link": ExternalLink,
};

export function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(
    DEFAULT_SITE_SETTINGS.footer
  );

  useEffect(() => {
    let active = true;

    async function loadFooterSettings() {
      try {
        const response = await fetch("/api/site-settings?keys=footer", {
          cache: "no-store",
        });

        if (!response.ok) return;
        const data = await response.json();
        if (!active || !data?.settings?.footer) return;

        setSettings(data.settings.footer as FooterSettings);
      } catch {
        // Keep defaults if the request fails.
      }
    }

    loadFooterSettings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <Image
                src="/logo.png"
                alt={settings.brandName}
                width={20}
                height={20}
                style={{ borderRadius: "4px" }}
              />
              {settings.brandName}
            </div>
            <p className={styles.tagline}>{settings.brandTagline}</p>
          </div>

          {settings.columns.map((column) => (
            <div key={column.title} className={styles.column}>
              <span className={styles.columnTitle}>{column.title}</span>
              {column.links.map((link) => (
                <Link
                  key={`${column.title}-${link.href}`}
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
            Copyright {new Date().getFullYear()} {settings.brandName}.{" "}
            {settings.copyrightNotice}
          </span>
          <div className={styles.socials}>
            {settings.socials.map((social) => {
              const Icon = FOOTER_ICON_MAP[social.icon];

              return (
                <a
                  key={`${social.icon}-${social.href}`}
                  href={social.href}
                  className={styles.socialLink}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
