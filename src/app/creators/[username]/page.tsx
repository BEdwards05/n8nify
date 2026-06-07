import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingRow } from "@/components/listing-row";
import { getCreatorByUsername } from "@/lib/queries/listings";
import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) return { title: "Creator not found" };
  return { title: creator.profile.displayName };
}

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) notFound();

  return (
    <div className="page-shell py-12 md:py-16">
      <p className="section-label mb-2">Creator</p>
      <h1 className="font-display text-4xl font-bold">
        {creator.profile.displayName}
      </h1>
      <p className="mt-1 text-muted">@{creator.profile.username}</p>
      {creator.profile.bio && (
        <p className="mt-6 max-w-2xl text-lg text-muted">{creator.profile.bio}</p>
      )}

      <h2 className="font-display mt-14 text-xl font-semibold">Published</h2>
      {creator.listings.length === 0 ? (
        <p className="mt-6 text-muted">No published workflows yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-line border-y border-line">
          {creator.listings.map((listing, i) => (
            <ListingRow
              key={listing.id}
              index={i}
              slug={listing.slug}
              title={listing.title}
              description={listing.description}
              priceCents={listing.priceCents}
              creatorName={creator.profile.displayName}
              previewMetadata={
                listing.previewMetadata as WorkflowPreviewMetadata | null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
