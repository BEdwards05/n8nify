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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">My purchases</h1>
      <p className="mb-8 text-muted">Workflows you own</p>

      {purchases.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="mb-4 text-muted">No purchases yet.</p>
          <Link href="/workflows" className="text-accent hover:underline">
            Browse workflows
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map(({ purchase, listing }) => (
            <div
              key={purchase.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <Link
                  href={`/workflows/${listing.slug}`}
                  className="font-medium hover:text-accent"
                >
                  {listing.title}
                </Link>
                <p className="text-sm text-muted">
                  Purchased {purchase.createdAt.toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/api/workflows/${listing.id}/download`}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-background"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
