import Link from "next/link";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

type Props = {
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  creatorName: string;
  previewMetadata?: WorkflowPreviewMetadata | null;
  index?: number;
};

export function ListingRow({
  slug,
  title,
  description,
  priceCents,
  creatorName,
  previewMetadata,
  index = 0,
}: Props) {
  const price =
    priceCents === 0
      ? "Free"
      : `$${(priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2)}`;

  const trigger = previewMetadata?.triggers?.[0];
  const integrations = previewMetadata?.integrations?.slice(0, 3) ?? [];

  return (
    <Link
      href={`/workflows/${slug}`}
      className="group flex flex-col gap-3 py-6 transition sm:flex-row sm:items-center sm:justify-between sm:gap-8"
    >
      <div className="flex min-w-0 flex-1 items-start gap-5">
        <span className="hidden w-8 shrink-0 pt-1 font-mono text-xs text-muted-dim sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold transition group-hover:text-accent">
              {title}
            </h3>
            {trigger && <span className="chip">{trigger}</span>}
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-muted">{description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {integrations.map((i) => (
              <span key={i} className="text-xs text-muted-dim">
                {i}
              </span>
            ))}
            {integrations.length > 0 && (
              <span className="text-muted-dim">·</span>
            )}
            <span className="text-xs text-muted-dim">{creatorName}</span>
          </div>
        </div>
      </div>
      <span className="shrink-0 font-display text-lg font-semibold text-foreground sm:text-right">
        {price}
      </span>
    </Link>
  );
}
