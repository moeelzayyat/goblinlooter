"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SiteSettingsBundle, SiteSettingKey } from "@/lib/site-settings-schema";
import styles from "./page.module.css";

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseJson<T>(value: string, label: string) {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`${label} contains invalid JSON.`);
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to save site settings.";
}

export function AdminSiteSettingsPanel({
  initialSettings,
}: {
  initialSettings: SiteSettingsBundle;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<SiteSettingKey | null>(null);

  const [homeForm, setHomeForm] = useState({
    heroBadgeLabel: initialSettings.home.heroBadgeLabel,
    heroTitle: initialSettings.home.heroTitle,
    heroTagline: initialSettings.home.heroTagline,
    heroSubtitle: initialSettings.home.heroSubtitle,
    emptyCatalogNote: initialSettings.home.emptyCatalogNote,
    whyTitle: initialSettings.home.whyTitle,
    whySubtitle: initialSettings.home.whySubtitle,
    pricingTitle: initialSettings.home.pricingTitle,
    pricingSubtitle: initialSettings.home.pricingSubtitle,
    pricingFallbackLabel: initialSettings.home.pricingFallbackLabel,
    pricingFallbackDescription: initialSettings.home.pricingFallbackDescription,
    stepsTitle: initialSettings.home.stepsTitle,
    stepsSubtitle: initialSettings.home.stepsSubtitle,
    protectionTitle: initialSettings.home.protectionTitle,
    protectionSubtitle: initialSettings.home.protectionSubtitle,
    ctaTitle: initialSettings.home.ctaTitle,
    ctaDescription: initialSettings.home.ctaDescription,
    proofStatsJson: formatJson(initialSettings.home.proofStats),
    featuresJson: formatJson(initialSettings.home.features),
    pricingFeaturesJson: formatJson(initialSettings.home.pricingFeatures),
    stepsJson: formatJson(initialSettings.home.steps),
    trustCardsJson: formatJson(initialSettings.home.trustCards),
  });

  const [shopForm, setShopForm] = useState({
    title: initialSettings.shop.title,
    subtitle: initialSettings.shop.subtitle,
    emptyStateMessage: initialSettings.shop.emptyStateMessage,
    emptyStateDescription: initialSettings.shop.emptyStateDescription,
  });

  const [supportForm, setSupportForm] = useState({
    title: initialSettings.support.title,
    subtitle: initialSettings.support.subtitle,
    searchPlaceholder: initialSettings.support.searchPlaceholder,
    contactTitle: initialSettings.support.contactTitle,
    contactSubjectLabel: initialSettings.support.contactSubjectLabel,
    contactSubjectPlaceholder: initialSettings.support.contactSubjectPlaceholder,
    contactMessageLabel: initialSettings.support.contactMessageLabel,
    contactMessagePlaceholder: initialSettings.support.contactMessagePlaceholder,
    contactSubmitLabel: initialSettings.support.contactSubmitLabel,
    contactSuccessMessage: initialSettings.support.contactSuccessMessage,
    contactLoggedOutHint: initialSettings.support.contactLoggedOutHint,
    categoriesJson: formatJson(initialSettings.support.categories),
  });

  const [footerForm, setFooterForm] = useState({
    brandName: initialSettings.footer.brandName,
    brandTagline: initialSettings.footer.brandTagline,
    copyrightNotice: initialSettings.footer.copyrightNotice,
    columnsJson: formatJson(initialSettings.footer.columns),
    socialsJson: formatJson(initialSettings.footer.socials),
  });

  const [legalForm, setLegalForm] = useState({
    refundPolicyJson: formatJson(initialSettings.legal.refundPolicy),
    termsJson: formatJson(initialSettings.legal.terms),
    privacyJson: formatJson(initialSettings.legal.privacy),
  });

  const jsonExamples = useMemo(
    () => ({
      stats: '[{"value":"500+","label":"Active Users"}]',
      features:
        '[{"icon":"zap","title":"Lightning Fast","desc":"Short feature copy"}]',
      steps: '[{"num":1,"title":"Purchase","desc":"Step copy"}]',
      footerColumns:
        '[{"title":"Shop","links":[{"label":"Browse Catalog","href":"/shop"}]}]',
      socials:
        '[{"label":"Discord","href":"https://discord.gg/example","icon":"message-circle"}]',
      supportCategories:
        '[{"id":"getting-started","name":"Getting Started","icon":"book-open","faqs":[{"q":"Question?","a":"Answer."}]}]',
      legal:
        '{"metaTitle":"Refund Policy - GoblinLooter","metaDescription":"Meta description","title":"Refund Policy","subtitle":"Page subtitle","ctaDescription":"CTA copy","ctaHref":"/support","ctaLabel":"Contact Support","sections":[{"title":"Overview","paragraphs":["Paragraph text"]}]}',
    }),
    []
  );

  function clearBanner() {
    setMessage(null);
    setError(null);
  }

  async function saveSection(key: SiteSettingKey, payload: unknown, successLabel: string) {
    setSavingSection(key);
    clearBanner();

    try {
      const response = await fetch(`/api/admin/site-settings/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save site settings.");
      }

      setMessage(successLabel);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save site settings."
      );
    } finally {
      setSavingSection(null);
    }
  }

  return (
    <section className={styles.dashboardStack}>
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Site Settings</h2>
            <p>
              Edit homepage copy, shop text, help center FAQs, footer links, and
              legal pages without touching the codebase.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.twoColumnGrid}>
        <form
          className={styles.panel}
          onSubmit={async (event) => {
            event.preventDefault();
            clearBanner();

            try {
              const payload = {
                ...homeForm,
                proofStats: parseJson(homeForm.proofStatsJson, "Homepage stats"),
                features: parseJson(homeForm.featuresJson, "Homepage features"),
                pricingFeatures: parseJson(
                  homeForm.pricingFeaturesJson,
                  "Homepage pricing features"
                ),
                steps: parseJson(homeForm.stepsJson, "Homepage steps"),
                trustCards: parseJson(homeForm.trustCardsJson, "Homepage trust cards"),
              };

              await saveSection("home", payload, "Homepage settings updated.");
            } catch (submitError) {
              setError(getErrorMessage(submitError));
            }
          }}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2>Homepage</h2>
              <p>Hero text, feature blocks, proof stats, pricing bullets, and CTA copy.</p>
            </div>
            <div className={styles.inlineActions}>
              <Button type="submit" loading={savingSection === "home"}>
                Save Homepage
              </Button>
            </div>
          </div>

          <div className={styles.form}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Hero badge</span>
                <input
                  value={homeForm.heroBadgeLabel}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      heroBadgeLabel: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Hero title</span>
                <input
                  value={homeForm.heroTitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      heroTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Hero tagline</span>
                <input
                  value={homeForm.heroTagline}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      heroTagline: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Catalog fallback note</span>
                <input
                  value={homeForm.emptyCatalogNote}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      emptyCatalogNote: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Hero subtitle</span>
              <textarea
                rows={3}
                value={homeForm.heroSubtitle}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    heroSubtitle: event.target.value,
                  }))
                }
              />
            </label>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Why section title</span>
                <input
                  value={homeForm.whyTitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      whyTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Why section subtitle</span>
                <input
                  value={homeForm.whySubtitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      whySubtitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Pricing title</span>
                <input
                  value={homeForm.pricingTitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      pricingTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Pricing subtitle</span>
                <input
                  value={homeForm.pricingSubtitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      pricingSubtitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Fallback pricing label</span>
                <input
                  value={homeForm.pricingFallbackLabel}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      pricingFallbackLabel: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Fallback pricing description</span>
                <input
                  value={homeForm.pricingFallbackDescription}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      pricingFallbackDescription: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Steps title</span>
                <input
                  value={homeForm.stepsTitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      stepsTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Steps subtitle</span>
                <input
                  value={homeForm.stepsSubtitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      stepsSubtitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Protection title</span>
                <input
                  value={homeForm.protectionTitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      protectionTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Protection subtitle</span>
                <input
                  value={homeForm.protectionSubtitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      protectionSubtitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>CTA title</span>
                <input
                  value={homeForm.ctaTitle}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      ctaTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>CTA fallback description</span>
                <input
                  value={homeForm.ctaDescription}
                  onChange={(event) =>
                    setHomeForm((current) => ({
                      ...current,
                      ctaDescription: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Proof stats JSON</span>
              <textarea
                rows={6}
                value={homeForm.proofStatsJson}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    proofStatsJson: event.target.value,
                  }))
                }
              />
              <small className={styles.helperText}>{jsonExamples.stats}</small>
            </label>

            <label className={styles.field}>
              <span>Features JSON</span>
              <textarea
                rows={10}
                value={homeForm.featuresJson}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    featuresJson: event.target.value,
                  }))
                }
              />
              <small className={styles.helperText}>{jsonExamples.features}</small>
            </label>

            <label className={styles.field}>
              <span>Pricing feature bullets JSON</span>
              <textarea
                rows={6}
                value={homeForm.pricingFeaturesJson}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    pricingFeaturesJson: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Steps JSON</span>
              <textarea
                rows={8}
                value={homeForm.stepsJson}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    stepsJson: event.target.value,
                  }))
                }
              />
              <small className={styles.helperText}>{jsonExamples.steps}</small>
            </label>

            <label className={styles.field}>
              <span>Trust cards JSON</span>
              <textarea
                rows={8}
                value={homeForm.trustCardsJson}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    trustCardsJson: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </form>

        <form
          className={styles.panel}
          onSubmit={async (event) => {
            event.preventDefault();
            await saveSection("shop", shopForm, "Shop settings updated.");
          }}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2>Shop</h2>
              <p>Shop header copy and empty-state messaging.</p>
            </div>
            <div className={styles.inlineActions}>
              <Button type="submit" loading={savingSection === "shop"}>
                Save Shop
              </Button>
            </div>
          </div>
          <div className={styles.form}>
            <label className={styles.field}>
              <span>Page title</span>
              <input
                value={shopForm.title}
                onChange={(event) =>
                  setShopForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Page subtitle</span>
              <textarea
                rows={3}
                value={shopForm.subtitle}
                onChange={(event) =>
                  setShopForm((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Empty-state headline</span>
              <input
                value={shopForm.emptyStateMessage}
                onChange={(event) =>
                  setShopForm((current) => ({
                    ...current,
                    emptyStateMessage: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Empty-state description</span>
              <textarea
                rows={3}
                value={shopForm.emptyStateDescription}
                onChange={(event) =>
                  setShopForm((current) => ({
                    ...current,
                    emptyStateDescription: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </form>
      </div>

      <div className={styles.twoColumnGrid}>
        <form
          className={styles.panel}
          onSubmit={async (event) => {
            event.preventDefault();
            clearBanner();

            try {
              const payload = {
                ...supportForm,
                categories: parseJson(
                  supportForm.categoriesJson,
                  "Support FAQ categories"
                ),
              };

              await saveSection("support", payload, "Support settings updated.");
            } catch (submitError) {
              setError(getErrorMessage(submitError));
            }
          }}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2>Support</h2>
              <p>Help center page copy, support form labels, and FAQ categories.</p>
            </div>
            <div className={styles.inlineActions}>
              <Button type="submit" loading={savingSection === "support"}>
                Save Support
              </Button>
            </div>
          </div>
          <div className={styles.form}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Page title</span>
                <input
                  value={supportForm.title}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Search placeholder</span>
                <input
                  value={supportForm.searchPlaceholder}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      searchPlaceholder: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Contact card title</span>
                <input
                  value={supportForm.contactTitle}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      contactTitle: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Submit button label</span>
                <input
                  value={supportForm.contactSubmitLabel}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      contactSubmitLabel: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Subject field label</span>
                <input
                  value={supportForm.contactSubjectLabel}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      contactSubjectLabel: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Subject placeholder</span>
                <input
                  value={supportForm.contactSubjectPlaceholder}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      contactSubjectPlaceholder: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Message field label</span>
                <input
                  value={supportForm.contactMessageLabel}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      contactMessageLabel: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Message placeholder</span>
                <input
                  value={supportForm.contactMessagePlaceholder}
                  onChange={(event) =>
                    setSupportForm((current) => ({
                      ...current,
                      contactMessagePlaceholder: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Page subtitle</span>
              <textarea
                rows={3}
                value={supportForm.subtitle}
                onChange={(event) =>
                  setSupportForm((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Success message</span>
              <textarea
                rows={3}
                value={supportForm.contactSuccessMessage}
                onChange={(event) =>
                  setSupportForm((current) => ({
                    ...current,
                    contactSuccessMessage: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Logged-out hint</span>
              <textarea
                rows={3}
                value={supportForm.contactLoggedOutHint}
                onChange={(event) =>
                  setSupportForm((current) => ({
                    ...current,
                    contactLoggedOutHint: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>FAQ categories JSON</span>
              <textarea
                rows={16}
                value={supportForm.categoriesJson}
                onChange={(event) =>
                  setSupportForm((current) => ({
                    ...current,
                    categoriesJson: event.target.value,
                  }))
                }
              />
              <small className={styles.helperText}>
                {jsonExamples.supportCategories}
              </small>
            </label>
          </div>
        </form>

        <form
          className={styles.panel}
          onSubmit={async (event) => {
            event.preventDefault();
            clearBanner();

            try {
              const payload = {
                ...footerForm,
                columns: parseJson(footerForm.columnsJson, "Footer columns"),
                socials: parseJson(footerForm.socialsJson, "Footer social links"),
              };

              await saveSection("footer", payload, "Footer settings updated.");
            } catch (submitError) {
              setError(getErrorMessage(submitError));
            }
          }}
        >
          <div className={styles.panelHeader}>
            <div>
              <h2>Footer</h2>
              <p>Branding, footer columns, copyright line, and social links.</p>
            </div>
            <div className={styles.inlineActions}>
              <Button type="submit" loading={savingSection === "footer"}>
                Save Footer
              </Button>
            </div>
          </div>
          <div className={styles.form}>
            <label className={styles.field}>
              <span>Brand name</span>
              <input
                value={footerForm.brandName}
                onChange={(event) =>
                  setFooterForm((current) => ({
                    ...current,
                    brandName: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Brand tagline</span>
              <textarea
                rows={3}
                value={footerForm.brandTagline}
                onChange={(event) =>
                  setFooterForm((current) => ({
                    ...current,
                    brandTagline: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Copyright note</span>
              <input
                value={footerForm.copyrightNotice}
                onChange={(event) =>
                  setFooterForm((current) => ({
                    ...current,
                    copyrightNotice: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span>Footer columns JSON</span>
              <textarea
                rows={10}
                value={footerForm.columnsJson}
                onChange={(event) =>
                  setFooterForm((current) => ({
                    ...current,
                    columnsJson: event.target.value,
                  }))
                }
              />
              <small className={styles.helperText}>{jsonExamples.footerColumns}</small>
            </label>
            <label className={styles.field}>
              <span>Footer socials JSON</span>
              <textarea
                rows={8}
                value={footerForm.socialsJson}
                onChange={(event) =>
                  setFooterForm((current) => ({
                    ...current,
                    socialsJson: event.target.value,
                  }))
                }
              />
              <small className={styles.helperText}>{jsonExamples.socials}</small>
            </label>
          </div>
        </form>
      </div>

      <form
        className={styles.panel}
        onSubmit={async (event) => {
          event.preventDefault();
          clearBanner();

          try {
            const payload = {
              refundPolicy: parseJson(legalForm.refundPolicyJson, "Refund policy"),
              terms: parseJson(legalForm.termsJson, "Terms"),
              privacy: parseJson(legalForm.privacyJson, "Privacy"),
            };

            await saveSection("legal", payload, "Legal page settings updated.");
          } catch (submitError) {
            setError(getErrorMessage(submitError));
          }
        }}
      >
        <div className={styles.panelHeader}>
          <div>
            <h2>Legal Pages</h2>
            <p>
              Edit refund policy, terms, and privacy copy. Each JSON object controls
              the page title, subtitle, CTA, metadata, and sections.
            </p>
          </div>
          <div className={styles.inlineActions}>
            <Button type="submit" loading={savingSection === "legal"}>
              Save Legal
            </Button>
          </div>
        </div>

        <div className={styles.form}>
          <label className={styles.field}>
            <span>Refund policy JSON</span>
            <textarea
              rows={16}
              value={legalForm.refundPolicyJson}
              onChange={(event) =>
                setLegalForm((current) => ({
                  ...current,
                  refundPolicyJson: event.target.value,
                }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>Terms JSON</span>
            <textarea
              rows={16}
              value={legalForm.termsJson}
              onChange={(event) =>
                setLegalForm((current) => ({
                  ...current,
                  termsJson: event.target.value,
                }))
              }
            />
          </label>
          <label className={styles.field}>
            <span>Privacy JSON</span>
            <textarea
              rows={16}
              value={legalForm.privacyJson}
              onChange={(event) =>
                setLegalForm((current) => ({
                  ...current,
                  privacyJson: event.target.value,
                }))
              }
            />
          </label>
          <small className={styles.helperText}>{jsonExamples.legal}</small>
        </div>
      </form>
    </section>
  );
}
