import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  creatorProfiles,
  listings,
  purchases,
  users,
} from "../../../drizzle/schema";

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) return null;

  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, userId),
  });

  const [purchaseStats] = await db
    .select({ count: count() })
    .from(purchases)
    .where(eq(purchases.buyerId, userId));

  const [listingStats] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.creatorId, userId));

  return {
    user,
    creatorProfile: profile,
    purchaseCount: purchaseStats?.count ?? 0,
    listingCount: listingStats?.count ?? 0,
  };
}

export type AdminUserFilters = {
  q?: string;
  role?: string;
  page?: number;
  limit?: number;
};

export async function getAdminUsers(filters: AdminUserFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters.q) {
    conditions.push(
      or(
        ilike(users.name, `%${filters.q}%`),
        ilike(users.email, `%${filters.q}%`),
      )!,
    );
  }
  if (filters.role && filters.role !== "all") {
    conditions.push(
      eq(users.role, filters.role as "buyer" | "creator" | "admin"),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      user: users,
      creator: creatorProfiles,
      purchaseCount: sql<number>`(
        SELECT count(*)::int FROM purchases WHERE buyer_id = ${users.id}
      )`,
      listingCount: sql<number>`(
        SELECT count(*)::int FROM listings WHERE creator_id = ${users.id}
      )`,
    })
    .from(users)
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(users)
    .where(where);

  return { items: rows, total, page, limit };
}

export async function getAdminUserStats() {
  const [buyers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "buyer"));
  const [creators] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "creator"));
  const [moderators] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "moderator"));
  const [admins] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "admin"));
  const [banned] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.banned, true));

  return {
    buyers: buyers?.count ?? 0,
    creators: creators?.count ?? 0,
    moderators: moderators?.count ?? 0,
    admins: admins?.count ?? 0,
    banned: banned?.count ?? 0,
    total:
      (buyers?.count ?? 0) +
      (creators?.count ?? 0) +
      (moderators?.count ?? 0) +
      (admins?.count ?? 0),
  };
}
