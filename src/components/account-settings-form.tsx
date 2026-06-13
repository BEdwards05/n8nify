"use client";

import { useState } from "react";
import { SettingsField } from "@/components/settings-field";
import { SettingsPanel } from "@/components/settings-panel";
import { authClient } from "@/lib/auth-client";

type Props = {
  initialName: string;
  email: string;
};

function StatusMessage({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return (
    <p className={`text-sm ${error ? "text-accent" : "text-muted"}`}>
      {error || message}
    </p>
  );
}

export function AccountSettingsForm({ initialName, email }: Props) {
  const [name, setName] = useState(initialName);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage("");
    setProfileError("");
    const { error: err } = await authClient.updateUser({ name });
    setProfileLoading(false);
    if (err) setProfileError(err.message ?? "Failed to update profile");
    else setProfileMessage("Saved.");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage("");
    setPasswordError("");
    const { error: err } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });
    setPasswordLoading(false);
    if (err) setPasswordError(err.message ?? "Failed to change password");
    else {
      setPasswordMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SettingsPanel
        title="Profile"
        description="How your name appears across n8nify."
      >
        <form onSubmit={saveProfile} className="space-y-5">
          <SettingsField label="Email" hint="Contact support to change your email.">
            <input value={email} disabled className="input opacity-50" />
          </SettingsField>
          <SettingsField label="Display name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </SettingsField>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StatusMessage message={profileMessage} error={profileError} />
            <button
              type="submit"
              disabled={profileLoading}
              className="btn btn-primary shrink-0"
            >
              Save changes
            </button>
          </div>
        </form>
      </SettingsPanel>

      <SettingsPanel
        title="Password"
        description="Use a strong password you don't reuse elsewhere."
      >
        <form onSubmit={changePassword} className="space-y-5">
          <SettingsField label="Current password">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
              required
            />
          </SettingsField>
          <SettingsField label="New password" hint="At least 8 characters.">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </SettingsField>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StatusMessage message={passwordMessage} error={passwordError} />
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-ghost shrink-0"
            >
              Update password
            </button>
          </div>
        </form>
      </SettingsPanel>
    </div>
  );
}
