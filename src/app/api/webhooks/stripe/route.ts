import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  creatorProfiles,
  listings,
  purchases,
  users,
} from "../../../../../drizzle/schema";
import { purchaseReceiptEmail, sendEmail } from "@/lib/email";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const listingId = session.metadata?.listingId;
    const buyerId = session.metadata?.buyerId;
    if (listingId && buyerId) {
      const existing = await db.query.purchases.findFirst({
        where: eq(purchases.stripeSessionId, session.id),
      });
      if (!existing) {
        await db.insert(purchases).values({
          buyerId,
          listingId,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id,
          amountCents: session.amount_total ?? 0,
        });
        const listing = await db.query.listings.findFirst({
          where: eq(listings.id, listingId),
        });
        const buyer = await db.query.users.findFirst({
          where: eq(users.id, buyerId),
        });
        if (listing && buyer) {
          await sendEmail({
            to: buyer.email,
            ...purchaseReceiptEmail(listing.title, listing.slug),
          });
        }
      }
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object;
    const profile = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.stripeConnectId, account.id),
    });
    if (profile) {
      await db
        .update(creatorProfiles)
        .set({
          payoutsEnabled: account.charges_enabled && account.payouts_enabled,
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.userId, profile.userId));
    }
  }

  return NextResponse.json({ received: true });
}
