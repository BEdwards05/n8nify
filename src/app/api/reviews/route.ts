import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { purchases, reviews } from "../../../../drizzle/schema";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId, rating, body } = await request.json();
  if (!listingId || !body || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.buyerId, session.user.id),
      eq(purchases.listingId, listingId),
    ),
  });
  if (!purchase) {
    return NextResponse.json(
      { error: "Verified purchase required" },
      { status: 403 },
    );
  }

  const existing = await db.query.reviews.findFirst({
    where: eq(reviews.purchaseId, purchase.id),
  });
  if (existing) {
    return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
  }

  await db.insert(reviews).values({
    listingId,
    buyerId: session.user.id,
    purchaseId: purchase.id,
    rating,
    body,
  });

  return NextResponse.json({ success: true });
}
