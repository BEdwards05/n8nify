import Link from "next/link";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

type Props = {
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  creatorName: string;
  creatorUsername?: string | null;
  previewMetadata?: WorkflowPreviewMetadata | null;
};

export function ListingCard({
  slug,
  title,
  description,
  priceCents,
  creatorName,
  creatorUsername,
  previewMetadata,
}: Props) {
  const price =
    priceCents === 0
      ? "Free"
      : `$${(priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2)}`;

  return (
    <Link
      href={`/workflows/${slug}`}
      className="group block rounded-lg border border-border bg-surface p-5 transition hover:border-accent/30"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug group-hover:text-accent">
          {title}
        </h3>
        <span className="shrink-0 text-sm font-medium">{price}</span>
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-muted">{description}</p>
      {previewMetadata && previewMetadata.integrations.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {previewMetadata.integrations.slice(0, 4).map((i) => (
            <span
              key={i}
              className="rounded bg-background px-2 py-0.5 text-xs text-muted"
            >
              {i}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted">
        by{" "}
        {creatorUsername ? (
          <span className="text-foreground">{creatorName}</span>
        ) : (
          creatorName
        )}
      </p>
    </Link>
  );
}
