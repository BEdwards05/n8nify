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
      window.location.reload();
    } else {
      setMessage(data.error ?? "Failed to submit");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-line bg-surface p-5">
      <p className="section-label">Leave a review</p>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="input"
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
        placeholder="How did this workflow work for you?"
        className="input resize-none"
      />
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
      {message && <p className="text-sm text-muted">{message}</p>}
    </form>
  );
}
