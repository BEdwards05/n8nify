import { ListingRow } from "@/components/listing-row";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

type Props = {
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  creatorName: string;
  creatorUsername?: string | null;
  previewMetadata?: WorkflowPreviewMetadata | null;
  index?: number;
};

/** @deprecated Use ListingRow — kept for compatibility */
export function ListingCard(props: Props) {
  return <ListingRow {...props} />;
}
