import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  adminAuditLog,
  listings,
  users,
} from "../../../../../../drizzle/schema";
import {
  listingApprovedEmail,
  listingRejectedEmail,
  sendEmail,
} from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, reason } = await request.json();
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
  });
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const creator = await db.query.users.findFirst({
    where: eq(users.id, listing.creatorId),
  });

  if (action === "approve") {
    await db
      .update(listings)
      .set({
        status: "published",
        publishedAt: new Date(),
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id));

    if (creator) {
      await sendEmail({
        to: creator.email,
        ...listingApprovedEmail(listing.title, listing.slug),
      });
    }
  } else if (action === "reject") {
    await db
      .update(listings)
      .set({
        status: "rejected",
        rejectionReason: reason ?? "Does not meet guidelines",
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id));

    if (creator) {
      await sendEmail({
        to: creator.email,
        ...listingRejectedEmail(
          listing.title,
          reason ?? "Does not meet guidelines",
        ),
      });
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await db.insert(adminAuditLog).values({
    adminId: session.user.id,
    action,
    targetType: "listing",
    targetId: id,
    metadata: { reason },
  });

  return NextResponse.json({ success: true });
}
