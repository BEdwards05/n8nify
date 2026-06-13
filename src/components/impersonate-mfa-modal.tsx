"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/modal";

type Props = {
  open: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type Mode = "totp" | "backup";

export function ImpersonateMfaModal({ open, onClose, targetUser }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setMode("totp");
    setCode("");
    setError("");
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUser) return;

    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUserId: targetUser.id,
        code,
        codeType: mode,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to impersonate user");
      return;
    }

    handleClose();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Confirm impersonation"
      description={
        targetUser
          ? `Verify your identity to sign in as ${targetUser.name} (${targetUser.email}).`
          : undefined
      }
    >
      <div className="mb-4 flex gap-1 rounded-full border border-line p-1">
        <button
          type="button"
          onClick={() => setMode("totp")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm ${
            mode === "totp"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Authenticator
        </button>
        <button
          type="button"
          onClick={() => setMode("backup")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm ${
            mode === "backup"
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Backup code
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={mode === "totp" ? "6-digit code" : "Backup code"}
          className="input"
          autoComplete="one-time-code"
        />
        {error && <p className="text-sm text-accent">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !targetUser}
            className="btn btn-primary"
          >
            {loading ? "Verifying…" : "Start impersonation"}
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
  );
}
