import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getUserPurchases } from "@/lib/queries/listings";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const purchases = await getUserPurchases(session.user.id);

  return (
    <>
      <header className="mb-10">
        <p className="section-label mb-2">Account</p>
        <h1 className="font-display text-3xl font-bold">Purchases</h1>
        <p className="mt-1 text-muted">Workflows you own</p>
      </header>

      {purchases.length === 0 ? (
        <div className="mt-12 border-t border-line pt-12 text-center">
          <p className="text-muted">No purchases yet.</p>
          <Link href="/workflows" className="btn btn-ghost mt-6 inline-flex">
            Browse workflows
          </Link>
        </div>
      ) : (
        <div className="mt-10 divide-y divide-line border-y border-line">
          {purchases.map(({ purchase, listing }) => (
            <div
              key={purchase.id}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/workflows/${listing.slug}`}
                  className="font-display font-semibold transition hover:text-accent"
                >
                  {listing.title}
                </Link>
                <p className="mt-1 text-sm text-muted-dim">
                  {purchase.createdAt.toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/api/workflows/${listing.id}/download`}
                className="btn btn-ghost shrink-0"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
