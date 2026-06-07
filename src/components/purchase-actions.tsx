"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  listingId: string;
  slug: string;
  priceCents: number;
  owns: boolean;
  isLoggedIn: boolean;
};

export function PurchaseActions({
  listingId,
  slug,
  priceCents,
  owns,
  isLoggedIn,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [importUrl, setImportUrl] = useState<string | null>(null);

  async function handlePurchase() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchImportUrl() {
    const res = await fetch(`/api/workflows/${listingId}/import-token`);
    const data = await res.json();
    if (data.url) setImportUrl(data.url);
  }

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=/workflows/${slug}`}
        className="block w-full rounded-md bg-accent py-2.5 text-center text-sm font-medium text-white hover:bg-accent-hover"
      >
        Sign in to {priceCents === 0 ? "get" : "buy"}
      </Link>
    );
  }

  if (owns) {
    return (
      <div className="space-y-3">
        <a
          href={`/api/workflows/${listingId}/download`}
          className="block w-full rounded-md bg-accent py-2.5 text-center text-sm font-medium text-white hover:bg-accent-hover"
        >
          Download JSON
        </a>
        <button
          type="button"
          onClick={fetchImportUrl}
          className="w-full rounded-md border border-border py-2.5 text-sm hover:bg-background"
        >
          Get Import URL
        </button>
        {importUrl && (
          <div className="rounded-md bg-background p-3 text-xs break-all">
            Paste in n8n → Import from URL:
            <br />
            <code>{importUrl}</code>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handlePurchase}
      className="w-full rounded-md bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
    >
      {loading
        ? "Processing..."
        : priceCents === 0
          ? "Get workflow"
          : "Buy workflow"}
    </button>
  );
}
