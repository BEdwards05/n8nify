import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { creatorProfiles } from "../../../../../drizzle/schema";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(
      new URL("/login", process.env.APP_URL ?? "http://localhost:3000"),
    );
  }

  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, session.user.id),
  });
  if (!profile) {
    return NextResponse.json({ error: "Creator profile required" }, { status: 400 });
  }

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  let accountId = profile.stripeConnectId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    await db
      .update(creatorProfiles)
      .set({ stripeConnectId: accountId, updatedAt: new Date() })
      .where(eq(creatorProfiles.userId, session.user.id));
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/seller`,
    return_url: `${appUrl}/dashboard/seller?stripe=connected`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(link.url);
}
