import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { creatorProfiles } from "../../../../drizzle/schema";
import { getCreatorListings } from "@/lib/queries/listings";

export const metadata = { title: "Seller Dashboard" };

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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Seller dashboard</h1>
          <p className="text-muted">Manage your workflow listings</p>
        </div>
        <Link
          href="/dashboard/seller/new"
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
        >
          New listing
        </Link>
      </div>

      <div className="mb-8 rounded-lg border border-border p-4">
        <p className="text-sm">
          Stripe payouts:{" "}
          <span className={profile.payoutsEnabled ? "text-green-700" : "text-muted"}>
            {profile.payoutsEnabled ? "Enabled" : "Not connected"}
          </span>
        </p>
        {!profile.payoutsEnabled && (
          <a
            href="/api/stripe/connect"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            Connect Stripe to receive payouts
          </a>
        )}
      </div>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium">{listing.title}</p>
              <p className="text-sm capitalize text-muted">
                {listing.status}
                {listing.status === "rejected" && listing.rejectionReason
                  ? ` — ${listing.rejectionReason}`
                  : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/seller/${listing.id}/edit`}
                className="text-sm text-accent hover:underline"
              >
                Edit
              </Link>
              {listing.status === "published" && (
                <Link
                  href={`/workflows/${listing.slug}`}
                  className="text-sm text-muted hover:underline"
                >
                  View
                </Link>
              )}
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <p className="text-muted">No listings yet. Create your first workflow.</p>
        )}
      </div>
    </div>
  );
}
