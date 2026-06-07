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
    <div className="page-shell py-12 md:py-16">
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

      <div className="grid gap-16 lg:grid-cols-[1fr_280px]">
        <article>
          <p className="section-label mb-4">
            {cats.map((c) => c.category.name).join(" · ") || "Workflow"}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {row.listing.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {row.listing.description}
          </p>

          {meta && <WorkflowPreview meta={meta} />}

          {owns && meta && (
            <div className="mt-10 border-t border-line pt-8">
              <p className="section-label mb-4">Setup checklist</p>
              <ol className="space-y-3">
                {meta.setupChecklist.map((item, i) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm text-muted"
                  >
                    <span className="font-mono text-xs text-muted-dim">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <section className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-xl font-semibold">
              Reviews
              {rating.count > 0 && (
                <span className="ml-2 text-base font-normal text-muted">
                  {rating.average.toFixed(1)} avg · {rating.count}
                </span>
              )}
            </h2>
            {owns && (
              <div className="mt-6">
                <ReviewForm listingId={row.listing.id} />
              </div>
            )}
            <div className="mt-8 divide-y divide-line">
              {reviews.map(({ review, buyer }) => (
                <div key={review.id} className="py-5">
                  <p className="text-sm font-medium">
                    {buyer.name}
                    <span className="ml-2 text-muted">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {review.body}
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="py-4 text-sm text-muted">No reviews yet.</p>
              )}
            </div>
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-display text-3xl font-bold">{price}</p>
          <div className="mt-4">
            <PurchaseActions
              listingId={row.listing.id}
              slug={row.listing.slug}
              priceCents={row.listing.priceCents}
              owns={owns}
              isLoggedIn={!!session}
            />
          </div>
          <div className="divider mt-8" />
          <p className="section-label mb-2 mt-6">Creator</p>
          {row.creator ? (
            <Link
              href={`/creators/${row.creator.username}`}
              className="text-sm transition hover:text-accent"
            >
              {row.creator.displayName}
            </Link>
          ) : (
            <p className="text-sm">{row.user.name}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
