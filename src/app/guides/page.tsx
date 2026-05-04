import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSetupGuide } from "@/lib/setup-guides";
import styles from "./page.module.css";

export default async function GuidesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/guides");
  }

  const orders = await prisma.order.findMany({
    where: {
      customerId: session.user.id,
      status: "delivered",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      items: {
        select: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              shortDescription: true,
              setupGuide: true,
            },
          },
        },
      },
    },
  });

  const guideMap = new Map<
    string,
    { title: string; slug: string; shortDescription: string; orderId: string }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const product = item.product;
      if (!product || !normalizeSetupGuide(product.setupGuide)) continue;
      if (guideMap.has(product.id)) continue;
      guideMap.set(product.id, {
        title: product.title,
        slug: product.slug,
        shortDescription: product.shortDescription,
        orderId: order.id,
      });
    }
  }

  const guides = [...guideMap.values()];

  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Customer Guides</span>
          <h1>Setup Guides</h1>
          <p>
            Product-specific setup videos, installation steps, and troubleshooting
            notes unlocked after purchase.
          </p>
        </header>

        {guides.length === 0 ? (
          <div className={styles.empty}>
            Delivered products with setup guides will appear here after purchase.
          </div>
        ) : (
          <div className={styles.grid}>
            {guides.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className={styles.card}>
                <span className={styles.meta}>Unlocked from order {guide.orderId}</span>
                <h2>{guide.title}</h2>
                <p>{guide.shortDescription}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
