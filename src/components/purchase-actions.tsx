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
        className="btn btn-primary w-full"
      >
        Sign in to {priceCents === 0 ? "get" : "buy"}
      </Link>
    );
  }

  if (owns) {
    return (
      <div className="space-y-3">
        <a href={`/api/workflows/${listingId}/download`} className="btn btn-primary w-full">
          Download JSON
        </a>
        <button
          type="button"
          onClick={fetchImportUrl}
          className="btn btn-ghost w-full"
        >
          Get import URL
        </button>
        {importUrl && (
          <p className="break-all rounded-xl border border-line bg-surface p-3 font-mono text-xs text-muted">
            {importUrl}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handlePurchase}
      className="btn btn-primary w-full disabled:opacity-50"
    >
      {loading
        ? "Processing…"
        : priceCents === 0
          ? "Get workflow"
          : "Buy workflow"}
    </button>
  );
}
