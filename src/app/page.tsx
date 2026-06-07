import Link from "next/link";
import { getAllCategories, getMarketplaceStats, getPublishedListings } from "@/lib/queries/listings";
import { ListingCard } from "@/components/listing-card";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let stats = { workflowCount: 0, creatorCount: 0 };
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  let featured: Awaited<ReturnType<typeof getPublishedListings>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 6,
  };
  try {
    [stats, categories, featured] = await Promise.all([
      getMarketplaceStats(),
      getAllCategories(),
      getPublishedListings({ limit: 6 }),
    ]);
  } catch {
    // DB unavailable during build or cold start
  }

  return (
    <div>
      <section className="relative min-h-[calc(100svh-3.5rem)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(var(--hero-overlay), var(--hero-overlay)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-3xl flex-col justify-center px-4 py-20 text-white">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/70">
            n8nify.io
          </p>
          <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Production-ready n8n workflows, ready to import
          </h1>
          <p className="mb-8 max-w-xl text-lg text-white/80">
            Browse templates built by automation experts. Download JSON or import
            directly into your n8n instance.
          </p>
          <form action="/workflows" className="mb-6 flex gap-2">
            <input
              name="q"
              type="search"
              placeholder="Search workflows..."
              className="flex-1 rounded-md border-0 px-4 py-3 text-foreground"
            />
            <button
              type="submit"
              className="rounded-md bg-accent px-5 py-3 font-medium text-white hover:bg-accent-hover"
            >
              Search
            </button>
          </form>
          <p className="text-sm text-white/60">
            {stats.workflowCount} workflows · {stats.creatorCount} creators
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-6 text-xl font-semibold">Browse by category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/workflows?category=${cat.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {featured.items.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Featured workflows</h2>
            <Link href="/workflows" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((row) => (
              <ListingCard
                key={row.listing.id}
                slug={row.listing.slug}
                title={row.listing.title}
                description={row.listing.description}
                priceCents={row.listing.priceCents}
                creatorName={row.creator?.displayName ?? row.user.name}
                creatorUsername={row.creator?.username}
                previewMetadata={
                  row.listing.previewMetadata as WorkflowPreviewMetadata | null
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-semibold">Sell your workflows</h2>
          <p className="mx-auto mb-6 max-w-lg text-muted">
            Upload your n8n templates, set your price, and earn when others
            import your automations.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-md bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover"
          >
            Become a creator
          </Link>
        </div>
      </section>
    </div>
  );
}
