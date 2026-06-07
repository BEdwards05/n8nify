import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { downloadTokens, purchases } from "../../../../../../drizzle/schema";

const tokenId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 32);

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id: listingId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.buyerId, session.user.id),
      eq(purchases.listingId, listingId),
    ),
  });
  if (!purchase) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const token = tokenId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(downloadTokens).values({
    purchaseId: purchase.id,
    token,
    expiresAt,
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return NextResponse.json({
    url: `${appUrl}/api/workflows/${listingId}/export.json?token=${token}`,
    expiresAt,
  });
}
