import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { listings } from "../../drizzle/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  let published: { slug: string; updatedAt: Date }[] = [];
  try {
    published = await db
      .select({ slug: listings.slug, updatedAt: listings.updatedAt })
      .from(listings)
      .where(eq(listings.status, "published"));
  } catch {
    published = [];
  }

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/workflows`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...published.map((l) => ({
      url: `${base}/workflows/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
