"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/modal";
import { SettingsField } from "@/components/settings-field";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/lib/permissions";

export function AdminCreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("buyer");
    setError("");
    setLoading(false);
  }

  function handleClose() {
    reset();
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: err } = await authClient.admin.createUser({
      email,
      password,
      name,
      role,
      data: { role },
    });

    setLoading(false);

    if (err) {
      setError(err.message ?? "Failed to create user");
      return;
    }

    if (data?.user?.id) {
      await fetch("/api/admin/users/lifecycle-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          targetUserId: data.user.id,
          email,
          name,
        }),
      });
    }

    handleClose();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary shrink-0"
      >
        Add user
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Create user"
        description="Add a new account with email and password."
      >
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsField label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </SettingsField>
            <SettingsField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </SettingsField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsField label="Password" hint="Minimum 8 characters.">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                minLength={8}
                required
              />
            </SettingsField>
            <SettingsField label="Role">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="input"
              >
                <option value="buyer">Buyer</option>
                <option value="creator">Creator</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </SettingsField>
          </div>
          {error && <p className="text-sm text-accent">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn btn-primary">
              Create user
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
