import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  categories,
  creatorProfiles,
  listingCategories,
  listings,
  purchases,
  reviews,
  users,
  workflowAssets,
} from "../../../drizzle/schema";
import type { WorkflowPreviewMetadata } from "../n8n/types";

export type ListingFilters = {
  q?: string;
  category?: string;
  trigger?: string;
  integration?: string;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
};

export async function getPublishedListings(filters: ListingFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const offset = (page - 1) * limit;

  const conditions = [eq(listings.status, "published")];

  if (filters.q) {
    conditions.push(
      or(
        ilike(listings.title, `%${filters.q}%`),
        ilike(listings.description, `%${filters.q}%`),
      )!,
    );
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(sql`${listings.priceCents} <= ${filters.maxPrice}`);
  }

  let listingIds: string[] | undefined;
  if (filters.category) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, filters.category),
    });
    if (cat) {
      const rows = await db
        .select({ listingId: listingCategories.listingId })
        .from(listingCategories)
        .where(eq(listingCategories.categoryId, cat.id));
      listingIds = rows.map((r) => r.listingId);
      if (listingIds.length === 0) return { items: [], total: 0, page, limit };
      conditions.push(inArray(listings.id, listingIds));
    }
  }

  const items = await db
    .select({
      listing: listings,
      creator: creatorProfiles,
      user: users,
    })
    .from(listings)
    .innerJoin(users, eq(listings.creatorId, users.id))
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(listings.publishedAt), desc(listings.createdAt))
    .limit(limit)
    .offset(offset);

  const filtered = items.filter((row) => {
    const meta = row.listing.previewMetadata as WorkflowPreviewMetadata | null;
    if (filters.trigger && meta && !meta.triggers?.includes(filters.trigger)) {
      return false;
    }
    if (
      filters.integration &&
      meta &&
      !meta.integrations?.some((i) =>
        i.toLowerCase().includes(filters.integration!.toLowerCase()),
      )
    ) {
      return false;
    }
    return true;
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(and(...conditions));

  return { items: filtered, total: count, page, limit };
}

export async function getListingBySlug(slug: string) {
  const rows = await db
    .select({
      listing: listings,
      creator: creatorProfiles,
      user: users,
      asset: workflowAssets,
    })
    .from(listings)
    .innerJoin(users, eq(listings.creatorId, users.id))
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .leftJoin(workflowAssets, eq(workflowAssets.listingId, listings.id))
    .where(eq(listings.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function getListingCategories(listingId: string) {
  return db
    .select({ category: categories })
    .from(listingCategories)
    .innerJoin(categories, eq(categories.id, listingCategories.categoryId))
    .where(eq(listingCategories.listingId, listingId));
}

export async function getListingReviews(listingId: string) {
  return db
    .select({
      review: reviews,
      buyer: users,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.buyerId))
    .where(eq(reviews.listingId, listingId))
    .orderBy(desc(reviews.createdAt));
}

export async function getListingRating(listingId: string) {
  const [row] = await db
    .select({
      avg: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.listingId, listingId));
  return { average: Number(row?.avg ?? 0), count: row?.count ?? 0 };
}

export async function userOwnsListing(
  buyerId: string,
  listingId: string,
): Promise<boolean> {
  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.buyerId, buyerId),
      eq(purchases.listingId, listingId),
    ),
  });
  return !!purchase;
}

export async function getUserPurchases(buyerId: string) {
  return db
    .select({
      purchase: purchases,
      listing: listings,
    })
    .from(purchases)
    .innerJoin(listings, eq(listings.id, purchases.listingId))
    .where(eq(purchases.buyerId, buyerId))
    .orderBy(desc(purchases.createdAt));
}

export async function getCreatorListings(creatorId: string) {
  return db
    .select()
    .from(listings)
    .where(eq(listings.creatorId, creatorId))
    .orderBy(desc(listings.updatedAt));
}

export async function getCreatorByUsername(username: string) {
  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.username, username),
  });
  if (!profile) return null;
  const user = await db.query.users.findFirst({
    where: eq(users.id, profile.userId),
  });
  const published = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.creatorId, profile.userId),
        eq(listings.status, "published"),
      ),
    )
    .orderBy(desc(listings.publishedAt));
  return { profile, user, listings: published };
}

export async function getAllCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getPendingListings() {
  return db
    .select({
      listing: listings,
      creator: creatorProfiles,
      user: users,
    })
    .from(listings)
    .innerJoin(users, eq(users.id, listings.creatorId))
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .where(eq(listings.status, "pending"))
    .orderBy(desc(listings.updatedAt));
}

export async function getMarketplaceStats() {
  const [published] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(eq(listings.status, "published"));
  const [creators] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(creatorProfiles);
  return {
    workflowCount: published?.count ?? 0,
    creatorCount: creators?.count ?? 0,
  };
}
