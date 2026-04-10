import "server-only";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SITE_SETTINGS,
  type FooterSettings,
  type FooterSocialIcon,
  type HomeFeature,
  type HomeFeatureIcon,
  type HomeSettings,
  type HomeStat,
  type HomeStep,
  type LegalPageSettings,
  type LegalSection,
  type LegalSettings,
  type ShopSettings,
  type SiteFooterColumn,
  type SiteFooterSocialLink,
  type SiteLink,
  type SiteSettingKey,
  type SiteSettingsBundle,
  type SupportCategory,
  type SupportCategoryIcon,
  type SupportFaq,
  type SupportSettings,
} from "@/lib/site-settings-schema";

export {
  DEFAULT_SITE_SETTINGS,
  type FooterSettings,
  type FooterSocialIcon,
  type HomeFeature,
  type HomeFeatureIcon,
  type HomeSettings,
  type HomeStat,
  type HomeStep,
  type LegalPageSettings,
  type LegalSection,
  type LegalSettings,
  type ShopSettings,
  type SiteFooterColumn,
  type SiteFooterSocialLink,
  type SiteLink,
  type SiteSettingKey,
  type SiteSettingsBundle,
  type SupportCategory,
  type SupportCategoryIcon,
  type SupportFaq,
  type SupportSettings,
} from "@/lib/site-settings-schema";

const HOME_ICONS = new Set<HomeFeatureIcon>([
  "zap",
  "shield-check",
  "download",
  "headphones",
  "gamepad",
  "bitcoin",
  "shield",
]);

const SUPPORT_ICONS = new Set<SupportCategoryIcon>([
  "book-open",
  "shopping-cart",
  "zap",
  "refresh-cw",
  "user-cog",
]);

const FOOTER_ICONS = new Set<FooterSocialIcon>([
  "globe",
  "message-circle",
  "external-link",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeLinkArray(
  value: unknown,
  options?: { allowIcons?: false }
): SiteLink[] | null;
function normalizeLinkArray(
  value: unknown,
  options: { allowIcons: true }
): SiteFooterSocialLink[] | null;
function normalizeLinkArray(
  value: unknown,
  { allowIcons = false }: { allowIcons?: boolean } = {}
): SiteLink[] | SiteFooterSocialLink[] | null {
  if (!Array.isArray(value)) return null;

  const items = value.map((item) => {
    if (!isRecord(item)) return null;

    const label = asString(item.label).trim();
    const href = asString(item.href).trim();
    if (!label || !href) return null;

    if (!allowIcons) {
      return { label, href };
    }

    const icon = asString(item.icon).trim() as FooterSocialIcon;
    if (!FOOTER_ICONS.has(icon)) return null;
    return { label, href, icon };
  });

  return items.every(Boolean)
    ? (items as SiteLink[] | SiteFooterSocialLink[])
    : null;
}

function normalizeHomeFeatures(value: unknown): HomeFeature[] | null {
  if (!Array.isArray(value)) return null;

  const items = value.map((item) => {
    if (!isRecord(item)) return null;
    const icon = asString(item.icon).trim() as HomeFeatureIcon;
    const title = asString(item.title).trim();
    const desc = asString(item.desc).trim();

    if (!HOME_ICONS.has(icon) || !title || !desc) return null;
    return { icon, title, desc };
  });

  return items.every(Boolean) ? (items as HomeFeature[]) : null;
}

function normalizeHomeSteps(value: unknown): HomeStep[] | null {
  if (!Array.isArray(value)) return null;

  const items = value.map((item) => {
    if (!isRecord(item)) return null;
    const num = Number(item.num);
    const title = asString(item.title).trim();
    const desc = asString(item.desc).trim();

    if (!Number.isFinite(num) || !title || !desc) return null;
    return { num, title, desc };
  });

  return items.every(Boolean) ? (items as HomeStep[]) : null;
}

function normalizeHomeStats(value: unknown): HomeStat[] | null {
  if (!Array.isArray(value)) return null;

  const items = value.map((item) => {
    if (!isRecord(item)) return null;
    const statValue = asString(item.value).trim();
    const label = asString(item.label).trim();
    if (!statValue || !label) return null;
    return { value: statValue, label };
  });

  return items.every(Boolean) ? (items as HomeStat[]) : null;
}

function normalizeSupportCategories(value: unknown): SupportCategory[] | null {
  if (!Array.isArray(value)) return null;

  const categories = value.map((item) => {
    if (!isRecord(item) || !Array.isArray(item.faqs)) return null;

    const id = asString(item.id).trim();
    const name = asString(item.name).trim();
    const icon = asString(item.icon).trim() as SupportCategoryIcon;
    if (!id || !name || !SUPPORT_ICONS.has(icon)) return null;

    const faqs = item.faqs.map((faq) => {
      if (!isRecord(faq)) return null;
      const q = asString(faq.q).trim();
      const a = asString(faq.a).trim();
      return q && a ? { q, a } : null;
    });

    if (!faqs.every(Boolean)) return null;

    return {
      id,
      name,
      icon,
      faqs: faqs as SupportFaq[],
    };
  });

  return categories.every(Boolean) ? (categories as SupportCategory[]) : null;
}

function normalizeFooterColumns(value: unknown): SiteFooterColumn[] | null {
  if (!Array.isArray(value)) return null;

  const columns = value.map((item) => {
    if (!isRecord(item)) return null;
    const title = asString(item.title).trim();
    const links = normalizeLinkArray(item.links);

    if (!title || !links) return null;
    return { title, links };
  });

  return columns.every(Boolean) ? (columns as SiteFooterColumn[]) : null;
}

function normalizeLegalSections(value: unknown): LegalSection[] | null {
  if (!Array.isArray(value)) return null;

  const sections = value.map((item) => {
    if (!isRecord(item)) return null;
    const title = asString(item.title).trim();
    if (!title) return null;

    return {
      title,
      paragraphs: Array.isArray(item.paragraphs)
        ? item.paragraphs.map((entry) => asString(entry).trim()).filter(Boolean)
        : undefined,
      bullets: Array.isArray(item.bullets)
        ? item.bullets.map((entry) => asString(entry).trim()).filter(Boolean)
        : undefined,
      orderedBullets: Array.isArray(item.orderedBullets)
        ? item.orderedBullets.map((entry) => asString(entry).trim()).filter(Boolean)
        : undefined,
    };
  });

  return sections.every(Boolean) ? (sections as LegalSection[]) : null;
}

function mergeObject<T>(defaults: T, stored: unknown): T {
  if (!isRecord(stored)) return defaults;
  return {
    ...defaults,
    ...stored,
  } as T;
}

function mergeHomeSettings(stored: unknown): HomeSettings {
  const merged = mergeObject(DEFAULT_SITE_SETTINGS.home, stored);

  return {
    ...merged,
    proofStats: normalizeHomeStats(merged.proofStats) || DEFAULT_SITE_SETTINGS.home.proofStats,
    features:
      normalizeHomeFeatures(merged.features) || DEFAULT_SITE_SETTINGS.home.features,
    pricingFeatures:
      Array.isArray(merged.pricingFeatures) &&
      merged.pricingFeatures.every((item) => typeof item === "string")
        ? merged.pricingFeatures.map((item) => item.trim()).filter(Boolean)
        : DEFAULT_SITE_SETTINGS.home.pricingFeatures,
    steps: normalizeHomeSteps(merged.steps) || DEFAULT_SITE_SETTINGS.home.steps,
    trustCards:
      normalizeHomeFeatures(merged.trustCards) || DEFAULT_SITE_SETTINGS.home.trustCards,
  };
}

function mergeSupportSettings(stored: unknown): SupportSettings {
  const merged = mergeObject(DEFAULT_SITE_SETTINGS.support, stored);

  return {
    ...merged,
    categories:
      normalizeSupportCategories(merged.categories) ||
      DEFAULT_SITE_SETTINGS.support.categories,
  };
}

function mergeFooterSettings(stored: unknown): FooterSettings {
  const merged = mergeObject(DEFAULT_SITE_SETTINGS.footer, stored);

  return {
    ...merged,
    columns:
      normalizeFooterColumns(merged.columns) || DEFAULT_SITE_SETTINGS.footer.columns,
    socials:
      normalizeLinkArray(merged.socials, { allowIcons: true }) ||
      DEFAULT_SITE_SETTINGS.footer.socials,
  };
}

function mergeLegalPageSettings(
  defaults: LegalPageSettings,
  stored: unknown
): LegalPageSettings {
  const merged = mergeObject(defaults, stored);

  return {
    ...merged,
    sections: normalizeLegalSections(merged.sections) || defaults.sections,
  };
}

function mergeLegalSettings(stored: unknown): LegalSettings {
  const merged = isRecord(stored) ? stored : {};

  return {
    refundPolicy: mergeLegalPageSettings(
      DEFAULT_SITE_SETTINGS.legal.refundPolicy,
      merged.refundPolicy
    ),
    terms: mergeLegalPageSettings(DEFAULT_SITE_SETTINGS.legal.terms, merged.terms),
    privacy: mergeLegalPageSettings(DEFAULT_SITE_SETTINGS.legal.privacy, merged.privacy),
  };
}

function normalizeHomeSettings(input: unknown) {
  if (!isRecord(input)) return { error: "Home settings are invalid." as const };

  const proofStats = normalizeHomeStats(input.proofStats);
  const features = normalizeHomeFeatures(input.features);
  const trustCards = normalizeHomeFeatures(input.trustCards);
  const steps = normalizeHomeSteps(input.steps);
  const pricingFeatures =
    Array.isArray(input.pricingFeatures) &&
    input.pricingFeatures.every((item) => typeof item === "string")
      ? input.pricingFeatures.map((item) => item.trim()).filter(Boolean)
      : null;

  if (!proofStats || !features || !trustCards || !steps || !pricingFeatures) {
    return { error: "One or more home lists are invalid." as const };
  }

  return {
    data: {
      heroBadgeLabel: asString(input.heroBadgeLabel).trim(),
      heroTitle: asString(input.heroTitle).trim(),
      heroTagline: asString(input.heroTagline).trim(),
      heroSubtitle: asString(input.heroSubtitle).trim(),
      emptyCatalogNote: asString(input.emptyCatalogNote).trim(),
      whyTitle: asString(input.whyTitle).trim(),
      whySubtitle: asString(input.whySubtitle).trim(),
      pricingTitle: asString(input.pricingTitle).trim(),
      pricingSubtitle: asString(input.pricingSubtitle).trim(),
      pricingFallbackLabel: asString(input.pricingFallbackLabel).trim(),
      pricingFallbackDescription: asString(input.pricingFallbackDescription).trim(),
      stepsTitle: asString(input.stepsTitle).trim(),
      stepsSubtitle: asString(input.stepsSubtitle).trim(),
      protectionTitle: asString(input.protectionTitle).trim(),
      protectionSubtitle: asString(input.protectionSubtitle).trim(),
      ctaTitle: asString(input.ctaTitle).trim(),
      ctaDescription: asString(input.ctaDescription).trim(),
      proofStats,
      features,
      pricingFeatures,
      steps,
      trustCards,
    } satisfies HomeSettings,
  };
}

function normalizeSupportSettings(input: unknown) {
  if (!isRecord(input)) return { error: "Support settings are invalid." as const };

  const categories = normalizeSupportCategories(input.categories);
  if (!categories) return { error: "Support FAQ categories are invalid." as const };

  return {
    data: {
      title: asString(input.title).trim(),
      subtitle: asString(input.subtitle).trim(),
      searchPlaceholder: asString(input.searchPlaceholder).trim(),
      contactTitle: asString(input.contactTitle).trim(),
      contactSubjectLabel: asString(input.contactSubjectLabel).trim(),
      contactSubjectPlaceholder: asString(input.contactSubjectPlaceholder).trim(),
      contactMessageLabel: asString(input.contactMessageLabel).trim(),
      contactMessagePlaceholder: asString(input.contactMessagePlaceholder).trim(),
      contactSubmitLabel: asString(input.contactSubmitLabel).trim(),
      contactSuccessMessage: asString(input.contactSuccessMessage).trim(),
      contactLoggedOutHint: asString(input.contactLoggedOutHint).trim(),
      categories,
    } satisfies SupportSettings,
  };
}

function normalizeFooterSettings(input: unknown) {
  if (!isRecord(input)) return { error: "Footer settings are invalid." as const };

  const columns = normalizeFooterColumns(input.columns);
  const socials = normalizeLinkArray(input.socials, { allowIcons: true });
  if (!columns || !socials) {
    return { error: "Footer links or social links are invalid." as const };
  }

  return {
    data: {
      brandName: asString(input.brandName).trim(),
      brandTagline: asString(input.brandTagline).trim(),
      copyrightNotice: asString(input.copyrightNotice).trim(),
      columns,
      socials,
    } satisfies FooterSettings,
  };
}

function normalizeShopSettings(input: unknown) {
  if (!isRecord(input)) return { error: "Shop settings are invalid." as const };

  return {
    data: {
      title: asString(input.title).trim(),
      subtitle: asString(input.subtitle).trim(),
      emptyStateMessage: asString(input.emptyStateMessage).trim(),
      emptyStateDescription: asString(input.emptyStateDescription).trim(),
    } satisfies ShopSettings,
  };
}

function normalizeLegalPageSettings(input: unknown, label: string) {
  if (!isRecord(input)) return { error: `${label} settings are invalid.` as const };

  const sections = normalizeLegalSections(input.sections);
  if (!sections) return { error: `${label} sections are invalid.` as const };

  return {
    data: {
      metaTitle: asString(input.metaTitle).trim(),
      metaDescription: asString(input.metaDescription).trim(),
      title: asString(input.title).trim(),
      subtitle: asString(input.subtitle).trim(),
      ctaDescription: asString(input.ctaDescription).trim(),
      ctaHref: asString(input.ctaHref).trim(),
      ctaLabel: asString(input.ctaLabel).trim(),
      sections,
    } satisfies LegalPageSettings,
  };
}

function normalizeLegalSettings(input: unknown) {
  if (!isRecord(input)) return { error: "Legal settings are invalid." as const };

  const refundPolicy = normalizeLegalPageSettings(input.refundPolicy, "Refund policy");
  if ("error" in refundPolicy) return refundPolicy;

  const terms = normalizeLegalPageSettings(input.terms, "Terms");
  if ("error" in terms) return terms;

  const privacy = normalizeLegalPageSettings(input.privacy, "Privacy");
  if ("error" in privacy) return privacy;

  return {
    data: {
      refundPolicy: refundPolicy.data,
      terms: terms.data,
      privacy: privacy.data,
    } satisfies LegalSettings,
  };
}

export function normalizeSiteSettingInput(key: SiteSettingKey, input: unknown) {
  switch (key) {
    case "home":
      return normalizeHomeSettings(input);
    case "shop":
      return normalizeShopSettings(input);
    case "support":
      return normalizeSupportSettings(input);
    case "footer":
      return normalizeFooterSettings(input);
    case "legal":
      return normalizeLegalSettings(input);
    default:
      return { error: "Unknown site setting key." as const };
  }
}

export async function getSiteSettings(): Promise<SiteSettingsBundle> {
  const rows = await prisma.siteSetting.findMany();
  const stored = new Map(rows.map((row) => [row.key, row.value]));

  return {
    home: mergeHomeSettings(stored.get("home")),
    shop: mergeObject(DEFAULT_SITE_SETTINGS.shop, stored.get("shop")),
    support: mergeSupportSettings(stored.get("support")),
    footer: mergeFooterSettings(stored.get("footer")),
    legal: mergeLegalSettings(stored.get("legal")),
  };
}

export async function upsertSiteSetting(
  key: SiteSettingKey,
  value: unknown
) {
  const jsonValue = value as Prisma.InputJsonValue;

  return prisma.siteSetting.upsert({
    where: { key },
    update: { value: jsonValue },
    create: { key, value: jsonValue },
  });
}

export function revalidateSiteSettingPaths(key: SiteSettingKey) {
  revalidatePath("/admin");

  if (key === "home" || key === "footer") {
    revalidatePath("/");
  }

  if (key === "shop" || key === "footer") {
    revalidatePath("/shop");
  }

  if (key === "support" || key === "footer") {
    revalidatePath("/support");
  }

  if (key === "legal" || key === "footer") {
    revalidatePath("/refund-policy");
    revalidatePath("/terms");
    revalidatePath("/privacy");
  }

  if (key === "footer") {
    revalidatePath("/orders");
    revalidatePath("/account");
  }
}
