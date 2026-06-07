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
    <div className="page-shell py-12 md:py-16">
      <p className="section-label mb-2">Creator setup</p>
      <h1 className="font-display text-3xl font-bold">Your seller profile</h1>
      <p className="mt-2 max-w-md text-muted">
        This is how buyers will find you on the marketplace.
      </p>
      <form onSubmit={onSubmit} className="mt-10 max-w-md space-y-4">
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="input"
        />
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="Username"
          pattern="[a-z0-9_]{3,20}"
          className="input"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio (optional)"
          rows={3}
          className="input resize-none"
        />
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" className="btn btn-primary w-full py-3">
          Continue
        </button>
      </form>
    </div>
  );
}
