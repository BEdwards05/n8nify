import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { downloadTokens, purchases } from "../../../../../../drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";
import { getWorkflowJsonForListing } from "@/lib/workflow-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id: listingId } = await params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 401 });
  }

  const allowed = await rateLimit(`export:${token}`, 10, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const row = await db
    .select({
      token: downloadTokens,
      purchase: purchases,
    })
    .from(downloadTokens)
    .innerJoin(purchases, eq(purchases.id, downloadTokens.purchaseId))
    .where(
      and(
        eq(downloadTokens.token, token),
        eq(purchases.listingId, listingId),
        gt(downloadTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row[0]) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  const json = await getWorkflowJsonForListing(listingId);
  return new NextResponse(json, {
    headers: { "Content-Type": "application/json" },
  });
}
