"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type Mode = "totp" | "backup";

export function TwoFactorVerifyForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const verify =
      mode === "totp"
        ? authClient.twoFactor.verifyTotp({ code, trustDevice })
        : authClient.twoFactor.verifyBackupCode({ code, trustDevice });

    const { error: err } = await verify;
    setLoading(false);

    if (err) {
      setError(err.message ?? "Invalid code");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex gap-1 rounded-full border border-line p-1">
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
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
          />
          Trust this device for 30 days
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3"
        >
          {loading ? "Verifying…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
