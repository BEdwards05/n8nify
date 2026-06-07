import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { WorkflowPreview } from "@/components/workflow-preview";
import { PurchaseActions } from "@/components/purchase-actions";
import { ReviewForm } from "@/components/review-form";
import { getSession } from "@/lib/auth-server";
import {
  getListingBySlug,
  getListingCategories,
  getListingRating,
  getListingReviews,
  userOwnsListing,
} from "@/lib/queries/listings";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const row = await getListingBySlug(slug);
  if (!row) return { title: "Workflow not found" };
  return {
    title: row.listing.title,
    description: row.listing.description,
  };
}

export default async function WorkflowDetailPage({ params }: Props) {
  const { slug } = await params;
  const row = await getListingBySlug(slug);
  if (!row || row.listing.status !== "published") notFound();

  const session = await getSession();
  const [cats, reviews, rating] = await Promise.all([
    getListingCategories(row.listing.id),
    getListingReviews(row.listing.id),
    getListingRating(row.listing.id),
  ]);

  const owns = session
    ? await userOwnsListing(session.user.id, row.listing.id)
    : false;

  const meta = row.listing.previewMetadata as WorkflowPreviewMetadata | null;
  const price =
    row.listing.priceCents === 0
      ? "Free"
      : `$${(row.listing.priceCents / 100).toFixed(2)}`;

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: row.listing.title,
          description: row.listing.description,
          url: `${appUrl}/workflows/${row.listing.slug}`,
          offers: {
            "@type": "Offer",
            price: (row.listing.priceCents / 100).toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="mb-2 text-sm text-muted">
            {cats.map((c) => c.category.name).join(" · ")}
          </p>
          <h1 className="mb-4 text-3xl font-semibold">{row.listing.title}</h1>
          <p className="mb-6 text-muted">{row.listing.description}</p>

          {meta && <WorkflowPreview meta={meta} />}

          {owns && meta && (
            <div className="mt-8 rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 font-medium">Setup checklist</h2>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
                {meta.setupChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          )}

          <section className="mt-10">
            <h2 className="mb-4 font-medium">
              Reviews {rating.count > 0 && `(${rating.average.toFixed(1)} ★)`}
            </h2>
            {owns && <ReviewForm listingId={row.listing.id} />}
            <div className="mt-4 space-y-4">
              {reviews.map(({ review, buyer }) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-border p-4"
                >
                  <p className="mb-1 text-sm font-medium">
                    {buyer.name} · {"★".repeat(review.rating)}
                  </p>
                  <p className="text-sm text-muted">{review.body}</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-muted">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-6">
            <p className="mb-1 text-2xl font-semibold">{price}</p>
            <PurchaseActions
              listingId={row.listing.id}
              slug={row.listing.slug}
              priceCents={row.listing.priceCents}
              owns={owns}
              isLoggedIn={!!session}
            />
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-2 text-sm font-medium">Creator</h3>
            {row.creator ? (
              <Link
                href={`/creators/${row.creator.username}`}
                className="text-accent hover:underline"
              >
                {row.creator.displayName}
              </Link>
            ) : (
              <p>{row.user.name}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
