import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { listings, purchases } from "../../../../../../drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";
import { getWorkflowJsonForListing } from "@/lib/workflow-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await rateLimit(
    `download:${session.user.id}`,
    30,
    3600,
  );
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
  });
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.buyerId, session.user.id),
      eq(purchases.listingId, id),
    ),
  });
  if (!purchase) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const json = await getWorkflowJsonForListing(id);
  await db
    .update(listings)
    .set({ downloadCount: sql`${listings.downloadCount} + 1` })
    .where(eq(listings.id, id));

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${listing.slug}.json"`,
    },
  });
}
