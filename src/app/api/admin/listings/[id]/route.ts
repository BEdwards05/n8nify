import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AuditActions, logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
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
  try {
    const session = await requirePermission("listings.moderate");
    const { id } = await params;
    const { action, reason } = await request.json();

    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, id),
    });
    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const actor = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      await logAudit({
        actorId: session.user.id,
        action: AuditActions.LISTING_APPROVE,
        targetType: "listing",
        targetId: id,
        summary: `${actor.name} approved listing “${listing.title}”`,
        metadata: { slug: listing.slug },
      });
    } else if (action === "reject") {
      const rejectionReason = reason ?? "Does not meet guidelines";
      await db
        .update(listings)
        .set({
          status: "rejected",
          rejectionReason,
          updatedAt: new Date(),
        })
        .where(eq(listings.id, id));

      if (creator) {
        await sendEmail({
          to: creator.email,
          ...listingRejectedEmail(listing.title, rejectionReason),
        });
      }

      await logAudit({
        actorId: session.user.id,
        action: AuditActions.LISTING_REJECT,
        targetType: "listing",
        targetId: id,
        summary: `${actor.name} rejected listing “${listing.title}” — ${rejectionReason}`,
        metadata: { reason: rejectionReason, slug: listing.slug },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
