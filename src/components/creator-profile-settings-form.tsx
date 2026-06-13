"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SettingsField } from "@/components/settings-field";
import { SettingsPanel } from "@/components/settings-panel";

type Props = {
  displayName: string;
  username: string;
  bio: string;
};

export function CreatorProfileSettingsForm({
  displayName: initialDisplayName,
  username: initialUsername,
  bio: initialBio,
}: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const res = await fetch("/api/user/creator-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, username, bio }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to update");
      return;
    }
    setMessage("Creator profile saved.");
    router.refresh();
  }

  return (
    <SettingsPanel
      title="Creator profile"
      description="Public details shown on your marketplace storefront."
      action={
        <Link
          href={`/creators/${username}`}
          className="text-sm text-accent hover:underline"
        >
          View storefront →
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              required
            />
          </SettingsField>
          <SettingsField label="Username" hint="Lowercase letters, numbers, underscores.">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="input"
              pattern="[a-z0-9_]{3,20}"
              required
            />
          </SettingsField>
        </div>
        <SettingsField label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="input resize-none"
            placeholder="Tell buyers about your workflows…"
          />
        </SettingsField>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {(message || error) && (
            <p className={`text-sm ${error ? "text-accent" : "text-muted"}`}>
              {error || message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-ghost shrink-0 sm:ml-auto"
          >
            Save creator profile
          </button>
        </div>
      </form>
    </SettingsPanel>
  );
}
