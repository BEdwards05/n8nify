import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-semibold">
          {creator.profile.displayName}
        </h1>
        <p className="text-muted">@{creator.profile.username}</p>
        {creator.profile.bio && (
          <p className="mt-4 max-w-2xl">{creator.profile.bio}</p>
        )}
      </div>

      <h2 className="mb-6 text-xl font-semibold">Published workflows</h2>
      {creator.listings.length === 0 ? (
        <p className="text-muted">No published workflows yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creator.listings.map((listing) => (
            <ListingCard
              key={listing.id}
              slug={listing.slug}
              title={listing.title}
              description={listing.description}
              priceCents={listing.priceCents}
              creatorName={creator.profile.displayName}
              creatorUsername={creator.profile.username}
              previewMetadata={
                listing.previewMetadata as WorkflowPreviewMetadata | null
              }
            />
          ))}
        </div>
      )}

      <p className="mt-8">
        <Link href="/workflows" className="text-accent hover:underline">
          Browse all workflows
        </Link>
      </p>
    </div>
  );
}
