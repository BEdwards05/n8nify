import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { creatorProfiles } from "../../../../drizzle/schema";
import { getCreatorListings } from "@/lib/queries/listings";

export const metadata = { title: "Seller" };

export default async function SellerDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "creator" && role !== "admin") redirect("/dashboard/seller/onboard");

  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, session.user.id),
  });
  if (!profile) redirect("/dashboard/seller/onboard");

  const listings = await getCreatorListings(session.user.id);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label mb-2">Creator</p>
          <h1 className="font-display text-3xl font-bold">Listings</h1>
        </div>
        <Link href="/dashboard/seller/new" className="btn btn-primary">
          New listing
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-3 text-sm">
        <span className="text-muted">Stripe payouts</span>
        <span
          className={profile.payoutsEnabled ? "text-accent" : "text-muted-dim"}
        >
          {profile.payoutsEnabled ? "Connected" : "Not connected"}
        </span>
        {!profile.payoutsEnabled && (
          <a href="/api/stripe/connect" className="text-accent hover:underline">
            Connect →
          </a>
        )}
      </div>

      <div className="divide-y divide-line border-y border-line">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{listing.title}</p>
              <p className="text-sm capitalize text-muted-dim">
                {listing.status}
                {listing.status === "rejected" && listing.rejectionReason
                  ? ` — ${listing.rejectionReason}`
                  : ""}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <Link
                href={`/dashboard/seller/${listing.id}/edit`}
                className="text-accent hover:underline"
              >
                Edit
              </Link>
              {listing.status === "published" && (
                <Link
                  href={`/workflows/${listing.slug}`}
                  className="text-muted hover:text-foreground"
                >
                  View
                </Link>
              )}
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <p className="py-8 text-muted">No listings yet.</p>
        )}
      </div>
    </>
  );
}
