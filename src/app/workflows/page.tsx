import { ListingCard } from "@/components/listing-card";
import { getAllCategories, getPublishedListings } from "@/lib/queries/listings";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    trigger?: string;
    integration?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

export const metadata = { title: "Browse Workflows" };

export default async function WorkflowsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const { items, total, limit } = await getPublishedListings({
    q: params.q,
    category: params.category,
    trigger: params.trigger,
    integration: params.integration,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    page,
  });
  const categories = await getAllCategories();
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold">Workflows</h1>
      <p className="mb-8 text-muted">{total} templates available</p>

      <form className="mb-8 grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search..."
          className="rounded-md border border-border px-3 py-2 text-sm md:col-span-2"
        />
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="integration"
          defaultValue={params.integration}
          placeholder="Integration filter"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          name="trigger"
          defaultValue={params.trigger}
          placeholder="Trigger type"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          name="maxPrice"
          type="number"
          defaultValue={params.maxPrice}
          placeholder="Max price (cents)"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover md:col-span-2"
        >
          Apply filters
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-muted">No workflows match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => (
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
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/workflows?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
              className={`rounded px-3 py-1 text-sm ${p === page ? "bg-accent text-white" : "border border-border"}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
