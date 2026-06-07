"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerOnboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/creator/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, username, bio }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to onboard");
      return;
    }
    router.push("/dashboard/seller");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Become a creator</h1>
      <p className="mb-8 text-sm text-muted">
        Set up your seller profile to start listing workflows.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="w-full rounded-md border border-border px-3 py-2"
        />
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="Username"
          pattern="[a-z0-9_]{3,20}"
          className="w-full rounded-md border border-border px-3 py-2"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio (optional)"
          rows={3}
          className="w-full rounded-md border border-border px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-accent py-2.5 text-white hover:bg-accent-hover"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
