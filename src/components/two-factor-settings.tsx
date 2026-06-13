"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SettingsField } from "@/components/settings-field";
import { SettingsPanel } from "@/components/settings-panel";
import { authClient } from "@/lib/auth-client";

type Props = {
  enabled: boolean;
  mfaRequired: boolean;
};

function MfaStatus({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`chip ${enabled ? "border-accent/40 text-accent" : "text-muted"}`}
    >
      {enabled ? "Enabled" : "Not enabled"}
    </span>
  );
}

export function TwoFactorSettings({ enabled, mfaRequired }: Props) {
  const router = useRouter();
  const [enablePassword, setEnablePassword] = useState("");
  const [regeneratePassword, setRegeneratePassword] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [code, setCode] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [step, setStep] = useState<"idle" | "setup" | "codes">("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isEnabled = enabled && step === "idle";

  async function startEnable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: err } = await authClient.twoFactor.enable({
      password: enablePassword,
      issuer: "n8nify",
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Failed to enable two-factor");
      return;
    }
    setTotpURI(data.totpURI);
    setBackupCodes(data.backupCodes);
    setStep("setup");
    setEnablePassword("");
  }

  async function confirmTotp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await authClient.twoFactor.verifyTotp({ code });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Invalid code");
      return;
    }
    setStep("codes");
    setCode("");
    await fetch("/api/user/audit-mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable" }),
    });
    router.refresh();
  }

  async function disableMfa(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await authClient.twoFactor.disable({
      password: disablePassword,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Failed to disable two-factor");
      return;
    }
    setMessage("Two-factor authentication disabled.");
    setDisablePassword("");
    await fetch("/api/user/audit-mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable" }),
    });
    router.refresh();
  }

  async function regenerateCodes(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: err } = await authClient.twoFactor.generateBackupCodes({
      password: regeneratePassword,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Failed to regenerate codes");
      return;
    }
    setBackupCodes(data.backupCodes);
    setStep("codes");
    setRegeneratePassword("");
    await fetch("/api/user/audit-mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "regenerate_backup_codes" }),
    });
  }

  if (step === "setup" && totpURI) {
    return (
      <SettingsPanel
        title="Set up authenticator"
        description="Step 1 of 2 — scan the QR code, then confirm with a code from your app."
        action={<span className="chip">Setup</span>}
      >
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpURI)}`}
            alt="TOTP QR code"
            width={180}
            height={180}
            className="rounded-xl border border-line bg-white p-2"
          />
          <form onSubmit={confirmTotp} className="space-y-5">
            <SettingsField
              label="Verification code"
              hint="Enter the 6-digit code from your authenticator app."
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input max-w-xs font-mono tracking-widest"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6}"
                placeholder="000000"
              />
            </SettingsField>
            {error && <p className="text-sm text-accent">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("idle");
                  setTotpURI(null);
                  setError("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                Verify & continue
              </button>
            </div>
          </form>
        </div>
      </SettingsPanel>
    );
  }

  if (step === "codes" && backupCodes) {
    return (
      <SettingsPanel
        title="Save your backup codes"
        description="Step 2 of 2 — each code works once if you lose your authenticator."
        action={<span className="chip text-accent">Important</span>}
      >
        <div className="grid gap-2 rounded-xl border border-line bg-surface p-4 font-mono text-sm sm:grid-cols-2">
          {backupCodes.map((c) => (
            <span key={c} className="py-1">
              {c}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Copy these to a password manager or secure note. You won&apos;t see them
          again.
        </p>
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setBackupCodes(null);
            setTotpURI(null);
            setMessage("Two-factor authentication is enabled.");
            router.refresh();
          }}
          className="btn btn-primary mt-6"
        >
          I&apos;ve saved my codes
        </button>
      </SettingsPanel>
    );
  }

  if (isEnabled) {
    return (
      <div className="space-y-6">
        <SettingsPanel
          title="Two-factor authentication"
          description="Your account uses an authenticator app and one-time backup codes."
          action={<MfaStatus enabled />}
        >
          {message && <p className="mb-5 text-sm text-muted">{message}</p>}
          <form onSubmit={regenerateCodes} className="space-y-5">
            <SettingsField
              label="Regenerate backup codes"
              hint="Invalidates previous codes. Requires your password."
            >
              <input
                type="password"
                value={regeneratePassword}
                onChange={(e) => setRegeneratePassword(e.target.value)}
                className="input max-w-sm"
                autoComplete="current-password"
                required
              />
            </SettingsField>
            <button type="submit" disabled={loading} className="btn btn-ghost">
              Generate new codes
            </button>
          </form>
        </SettingsPanel>

        {!mfaRequired && (
          <SettingsPanel
            title="Disable two-factor"
            description="Removes the extra sign-in step. Not recommended."
          >
            <form onSubmit={disableMfa} className="space-y-5">
              <SettingsField label="Confirm password">
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="input max-w-sm"
                  autoComplete="current-password"
                  required
                />
              </SettingsField>
              <button type="submit" disabled={loading} className="btn btn-ghost">
                Disable two-factor
              </button>
            </form>
          </SettingsPanel>
        )}

        {mfaRequired && (
          <p className="text-sm text-muted-dim">
            Two-factor cannot be disabled while you hold an admin or moderator
            role.
          </p>
        )}

        {error && <p className="text-sm text-accent">{error}</p>}
      </div>
    );
  }

  return (
    <SettingsPanel
      title="Two-factor authentication"
      description="Protect your account with an authenticator app (Google Authenticator, 1Password, etc.) and printable backup codes."
      action={<MfaStatus enabled={false} />}
    >
      {mfaRequired && (
        <p className="mb-5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          Required for admin and moderator accounts before accessing the admin
          area.
        </p>
      )}
      <form onSubmit={startEnable} className="space-y-5">
        <SettingsField label="Confirm password">
          <input
            type="password"
            value={enablePassword}
            onChange={(e) => setEnablePassword(e.target.value)}
            className="input max-w-sm"
            autoComplete="current-password"
            required
          />
        </SettingsField>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary">
          Enable two-factor
        </button>
      </form>
    </SettingsPanel>
  );
}
