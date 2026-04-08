import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  orderedBullets?: string[];
};

interface LegalPageProps {
  title: string;
  subtitle?: string;
  sections: LegalSection[];
  ctaDescription?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

const sectionTitleStyle = {
  fontSize: "var(--text-md)",
  fontWeight: 600,
  marginBottom: "var(--space-md)",
} as const;

const bodyTextStyle = {
  color: "var(--text-secondary)",
  fontSize: "var(--text-sm)",
  lineHeight: 1.7,
} as const;

const listStyle = {
  ...bodyTextStyle,
  lineHeight: 1.8,
  paddingLeft: "var(--space-lg)",
} as const;

export function LegalPage({
  title,
  subtitle,
  sections,
  ctaDescription,
  ctaHref,
  ctaLabel,
}: LegalPageProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main
        style={{
          flex: 1,
          maxWidth: 720,
          margin: "0 auto",
          padding: "var(--space-xl) var(--space-lg)",
          width: "100%",
        }}
      >
        <PageHeader title={title} subtitle={subtitle} />

        <article
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xl)",
          }}
        >
          {sections.map((section) => (
            <section key={section.title}>
              <h2 style={sectionTitleStyle}>{section.title}</h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{
                    ...bodyTextStyle,
                    marginTop: "var(--space-sm)",
                  }}
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets ? (
                <ul style={listStyle}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}

              {section.orderedBullets ? (
                <ol style={listStyle}>
                  {section.orderedBullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}

          {ctaDescription && ctaHref && ctaLabel ? (
            <div
              style={{
                padding: "var(--space-lg)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "var(--text-sm)",
                  marginBottom: "var(--space-md)",
                }}
              >
                {ctaDescription}
              </p>
              <Link href={ctaHref}>
                <Button variant="secondary" size="sm">
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          ) : null}
        </article>
      </main>
      <Footer />
    </div>
  );
}
