"use client";

import { useState } from "react";

export function ReviewForm({ listingId }: { listingId: string }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, rating, body }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Review submitted!");
      window.location.reload();
    } else {
      setMessage(data.error ?? "Failed to submit review");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border p-4">
      <h3 className="mb-3 text-sm font-medium">Leave a review</h3>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="mb-3 w-full rounded-md border border-border px-3 py-2 text-sm"
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r} stars
          </option>
        ))}
      </select>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
        placeholder="Share your experience..."
        className="mb-3 w-full rounded-md border border-border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
      >
        Submit review
      </button>
      {message && <p className="mt-2 text-sm text-muted">{message}</p>}
    </form>
  );
}
