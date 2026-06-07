"use client";

import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

type Item = {
  listing: {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    previewMetadata: unknown;
  };
  creator: { displayName: string; username: string } | null;
  user: { name: string; email: string };
};

export function AdminQueue({ items }: { items: Item[] }) {
  async function moderate(
    listingId: string,
    action: "approve" | "reject",
    reason?: string,
  ) {
    await fetch(`/api/admin/listings/${listingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    window.location.reload();
  }

  if (items.length === 0) {
    return <p className="text-muted">Queue is empty.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map(({ listing, creator, user }) => {
        const meta = listing.previewMetadata as WorkflowPreviewMetadata | null;
        return (
          <div key={listing.id} className="py-6">
            <h3 className="font-display text-lg font-semibold">{listing.title}</h3>
            <p className="mt-1 text-sm text-muted-dim">
              {creator?.displayName ?? user.name} · {user.email}
            </p>
            <p className="mt-3 text-sm text-muted">{listing.description}</p>
            {meta && (
              <p className="mt-2 text-xs text-muted-dim">
                {meta.nodeCount} nodes · {meta.integrations.join(", ")}
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => moderate(listing.id, "approve")}
                className="btn btn-primary"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => {
                  const reason = prompt("Rejection reason:");
                  if (reason) moderate(listing.id, "reject", reason);
                }}
                className="btn btn-ghost"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
