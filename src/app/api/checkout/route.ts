import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  creatorProfiles,
  listings,
  purchases,
  users,
} from "../../../../drizzle/schema";
import {
  getOrCreateStripeCustomer,
  platformFeeAmount,
  stripe,
} from "@/lib/stripe";
import { purchaseReceiptEmail, sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();
  const listing = await db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.status, "published")),
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const existing = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.buyerId, session.user.id),
      eq(purchases.listingId, listingId),
    ),
  });
  if (existing) {
    return NextResponse.json({ success: true, alreadyOwned: true });
  }

  if (listing.priceCents === 0) {
    await db.insert(purchases).values({
      buyerId: session.user.id,
      listingId: listing.id,
      amountCents: 0,
    });
    await sendEmail({
      to: session.user.email,
      ...purchaseReceiptEmail(listing.title, listing.slug),
    });
    return NextResponse.json({ success: true });
  }

  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, listing.creatorId),
  });
  if (!creator?.stripeConnectId || !creator.payoutsEnabled) {
    return NextResponse.json(
      { error: "Seller cannot accept payments yet" },
      { status: 400 },
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  const customerId = await getOrCreateStripeCustomer(
    session.user.email,
    session.user.name,
    user?.stripeCustomerId,
  );
  if (!user?.stripeCustomerId) {
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, session.user.id));
  }

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const fee = platformFeeAmount(listing.priceCents);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: listing.title,
            description: listing.description.slice(0, 200),
          },
          unit_amount: listing.priceCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee,
      transfer_data: { destination: creator.stripeConnectId },
    },
    metadata: {
      listingId: listing.id,
      buyerId: session.user.id,
    },
    success_url: `${appUrl}/workflows/${listing.slug}?purchased=1`,
    cancel_url: `${appUrl}/workflows/${listing.slug}`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
