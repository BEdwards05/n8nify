import Link from "next/link";
import { ListingRow } from "@/components/listing-row";
import {
  getAllCategories,
  getMarketplaceStats,
  getPublishedListings,
} from "@/lib/queries/listings";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let stats = { workflowCount: 0, creatorCount: 0 };
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  let featured: Awaited<ReturnType<typeof getPublishedListings>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 5,
  };
  try {
    [stats, categories, featured] = await Promise.all([
      getMarketplaceStats(),
      getAllCategories(),
      getPublishedListings({ limit: 5 }),
    ]);
  } catch {
    // DB unavailable
  }

  return (
    <>
      {/* Full-bleed hero — edge to edge, no page gutters */}
      <section className="relative -mt-[3.75rem] min-h-svh overflow-hidden pt-[3.75rem]">
        <div className="node-field">
          <div className="node-grid" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />

        <div className="relative mx-auto flex min-h-[calc(100svh-3.75rem)] max-w-4xl flex-col justify-center px-5 pb-16 pt-8">
          <p className="animate-rise font-display text-[clamp(3.5rem,12vw,7rem)] font-extrabold leading-[0.9] tracking-tight">
            n8n<span className="text-accent">ify</span>
          </p>
          <h1 className="animate-rise animate-rise-delay-1 mt-6 max-w-xl font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-white/95">
            Workflows you can import today
          </h1>
          <p className="animate-rise animate-rise-delay-2 mt-4 max-w-md text-base text-white/55">
            Templates built by automation experts. One click to download, one
            URL to import into n8n.
          </p>

          <form
            action="/workflows"
            className="animate-rise animate-rise-delay-3 mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              name="q"
              type="search"
              placeholder="Search by integration, trigger, use case…"
              className="input-hero flex-1"
            />
            <button type="submit" className="btn btn-primary shrink-0 px-6 py-3">
              Search
            </button>
          </form>

          <p className="mt-6 text-sm text-white/35">
            {stats.workflowCount} workflows · {stats.creatorCount} creators
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="page-shell py-16">
          <p className="section-label mb-6">Categories</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/workflows?category=${cat.slug}`}
                className="font-display text-lg text-muted transition hover:text-accent"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured list — no card grid */}
      {featured.items.length > 0 && (
        <section className="page-shell pb-20">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold">Latest</h2>
            <Link
              href="/workflows"
              className="text-sm text-muted transition hover:text-accent"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {featured.items.map((row, i) => (
              <ListingRow
                key={row.listing.id}
                index={i}
                slug={row.listing.slug}
                title={row.listing.title}
                description={row.listing.description}
                priceCents={row.listing.priceCents}
                creatorName={row.creator?.displayName ?? row.user.name}
                previewMetadata={
                  row.listing.previewMetadata as WorkflowPreviewMetadata | null
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="node-field opacity-40">
          <div className="node-grid" />
        </div>
        <div className="page-shell relative py-24">
          <p className="section-label mb-4">For creators</p>
          <h2 className="font-display max-w-lg text-3xl font-semibold leading-tight md:text-4xl">
            Ship your automations. Keep the revenue.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Upload workflow JSON, set a price, and get paid when others import
            your templates.
          </p>
          <Link href="/register" className="btn btn-primary mt-8">
            Start selling
          </Link>
        </div>
      </section>
    </>
  );
}
