import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getEmbeddableVideoUrl,
  isDirectVideoUrl,
  normalizeSetupGuide,
} from "@/lib/setup-guides";
import styles from "../page.module.css";

export default async function ProductGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/guides/${slug}`)}`);
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      shortDescription: true,
      setupGuide: true,
      orderItems: {
        where: {
          order: {
            customerId: session.user.id,
            status: "delivered",
          },
        },
        select: {
          orderId: true,
        },
        take: 1,
      },
    },
  });

  const guide = normalizeSetupGuide(product?.setupGuide);
  const hasAccess = Boolean(product?.orderItems.length);

  if (!product || !guide || !hasAccess) {
    notFound();
  }

  const embedUrl = getEmbeddableVideoUrl(guide.videoUrl);

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Setup Guide</span>
          <h1>{product.title}</h1>
          <p>{product.shortDescription}</p>
        </header>

        <div className={styles.guideShell}>
          {embedUrl ? (
            <section className={styles.section}>
              <h2>Setup Video Guide</h2>
              <div className={styles.videoFrame}>
                {isDirectVideoUrl(embedUrl) ? (
                  <video src={embedUrl} controls preload="metadata" />
                ) : (
                  <iframe
                    src={embedUrl}
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
              <h2>Installation Steps</h2>
              <ol className={styles.steps}>
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          ) : null}

          {guide.fixes.length > 0 ? (
            <section className={styles.section}>
              <h2>Errors & Fixes</h2>
              <div className={styles.fixList}>
                {guide.fixes.map((item) => (
                  <div key={`${item.error}-${item.fix}`} className={styles.fix}>
                    <strong>ERROR: {item.error}</strong>
                    <p>FIX: {item.fix}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {guide.notes ? (
            <section className={styles.section}>
              <h2>Notes</h2>
              <p className={styles.notes}>{guide.notes}</p>
            </section>
          ) : null}

          <div>
            <Link href="/guides" className={styles.meta}>
              Back to all setup guides
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
