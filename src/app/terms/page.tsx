import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSiteSettings()).legal.terms;

  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
  };
}

export default async function TermsPage() {
  const settings = (await getSiteSettings()).legal.terms;

  return (
    <LegalPage
      title={settings.title}
      subtitle={settings.subtitle}
      sections={settings.sections}
      ctaDescription={settings.ctaDescription}
      ctaHref={settings.ctaHref}
      ctaLabel={settings.ctaLabel}
    />
  );
}
