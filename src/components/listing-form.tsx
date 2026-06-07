"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = { id: string; slug: string; name: string };
type Listing = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  status: string;
};

type Props = {
  categories: Category[];
  listing?: Listing;
  selectedCategoryIds?: string[];
};

export function ListingForm({
  categories,
  listing,
  selectedCategoryIds = [],
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [priceDollars, setPriceDollars] = useState(
    listing ? (listing.priceCents / 100).toString() : "0",
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(selectedCategoryIds);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleCategory(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function save(submitForReview: boolean) {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("priceCents", String(Math.round(Number(priceDollars) * 100)));
      formData.append("categoryIds", JSON.stringify(categoryIds));
      formData.append("submitForReview", String(submitForReview));
      if (file) formData.append("workflow", file);

      const url = listing
        ? `/api/listings/${listing.id}`
        : "/api/listings";
      const method = listing ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.push("/dashboard/seller");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded-md border border-border px-3 py-2"
      />
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={5}
        className="w-full rounded-md border border-border px-3 py-2"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={priceDollars}
        onChange={(e) => setPriceDollars(e.target.value)}
        placeholder="Price (USD, 0 for free)"
        className="w-full rounded-md border border-border px-3 py-2"
      />
      <div>
        <p className="mb-2 text-sm font-medium">Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`rounded-full border px-3 py-1 text-sm ${
                categoryIds.includes(cat.id)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">
          Workflow JSON {listing ? "(upload to replace)" : ""}
        </p>
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => save(false)}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => save(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover disabled:opacity-50"
        >
          Submit for review
        </button>
      </div>
    </div>
  );
}
