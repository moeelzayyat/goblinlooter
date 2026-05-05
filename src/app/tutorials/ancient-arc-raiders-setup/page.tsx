import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getEmbeddableVideoUrl,
  isDirectVideoUrl,
  normalizeSetupGuide,
} from "@/lib/setup-guides";
import styles from "./page.module.css";

const PRODUCT_SLUG =
  "ancient-arc-raiders-undetected-aimbot-esp-radar-visual-enhancements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ancient Setup Guide + Fixes",
  description:
    "Unlisted customer setup guide with installation steps, video, and troubleshooting fixes.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AncientArcRaidersTutorialPage() {
  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    select: {
      id: true,
      title: true,
      shortDescription: true,
      setupGuide: true,
      productVideo: {
        select: {
          id: true,
        },
      },
    },
  });

  const guide = normalizeSetupGuide(product?.setupGuide);

  if (!product || !guide) {
    notFound();
  }

  const uploadedVideoUrl = product.productVideo
    ? `/api/products/${product.id}/video`
    : null;
  const videoUrl = guide.videoUrl
    ? getEmbeddableVideoUrl(guide.videoUrl)
    : uploadedVideoUrl;
  const isVideoFile =
    Boolean(uploadedVideoUrl && videoUrl === uploadedVideoUrl) ||
    isDirectVideoUrl(videoUrl);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <span className={styles.brandMark}>GL</span>
          <span>GoblinLooter Customer Guide</span>
        </div>
        <h1>Ancient Setup Guide + Fixes</h1>
        <p>
          Complete installation instructions and troubleshooting for your
          Ancient access. Follow each step carefully before opening a support
          ticket.
        </p>
      </header>

      <div className={styles.guideShell}>
        {videoUrl ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>01</span>
              <h2>Setup Video Guide</h2>
            </div>
            <div className={styles.videoFrame}>
              {isVideoFile ? (
                <video src={videoUrl} controls preload="metadata" />
              ) : (
                <iframe
                  src={videoUrl}
                  title={`${product.title} setup guide`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </section>
        ) : null}

        {guide.steps.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>02</span>
              <h2>Installation Steps</h2>
            </div>
            <ol className={styles.steps}>
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {guide.fixes.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>03</span>
              <h2>Errors & Fixes</h2>
            </div>
            <div className={styles.fixList}>
              {guide.fixes.map((item) => (
                <article key={`${item.error}-${item.fix}`} className={styles.fix}>
                  <h3>ERROR: {item.error}</h3>
                  <p>FIX: {item.fix}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {guide.notes ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>04</span>
              <h2>Important Notes</h2>
            </div>
            <p className={styles.notes}>{guide.notes}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
