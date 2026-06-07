import { ListingRow } from "@/components/listing-row";
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

export const metadata = { title: "Workflows" };

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
  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <div className="page-shell py-12 md:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="section-label mb-3">Catalog</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Workflows
        </h1>
        <p className="mt-2 text-muted">
          {total} template{total === 1 ? "" : "s"}
          {activeCategory ? ` in ${activeCategory.name}` : ""}
        </p>
      </header>

      <form className="mb-12 space-y-4 border-b border-line pb-10">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search workflows…"
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary shrink-0 px-8">
            Search
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select name="category" defaultValue={params.category ?? ""} className="input">
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
            placeholder="Integration"
            className="input"
          />
          <input
            name="trigger"
            defaultValue={params.trigger}
            placeholder="Trigger type"
            className="input"
          />
          <input
            name="maxPrice"
            type="number"
            defaultValue={params.maxPrice}
            placeholder="Max price (¢)"
            className="input"
          />
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-muted">No workflows match your filters.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {items.map((row, i) => (
            <ListingRow
              key={row.listing.id}
              index={(page - 1) * limit + i}
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
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/workflows?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                p === page
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
