"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Props = {
  viewingAsId: string;
  viewingAsName: string;
  viewingAsEmail: string;
  adminName?: string;
};

export function ImpersonationBanner({
  viewingAsId,
  viewingAsName,
  viewingAsEmail,
  adminName,
}: Props) {
  const router = useRouter();

  async function stopImpersonating() {
    await authClient.admin.stopImpersonating();
    await fetch("/api/admin/impersonate-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: viewingAsId, action: "stop" }),
    });
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <div className="border-b border-accent/40 bg-accent/15">
      <div className="page-shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="font-medium text-accent">Impersonating</span>{" "}
          <span className="text-foreground">{viewingAsName}</span>
          <span className="text-muted"> ({viewingAsEmail})</span>
          {adminName && (
            <span className="mt-1 block text-xs text-muted-dim sm:mt-0 sm:ml-2 sm:inline">
              Signed in as admin: {adminName}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={stopImpersonating}
          className="btn btn-ghost shrink-0 border-accent/30 text-sm"
        >
          Exit impersonation
        </button>
      </div>
    </div>
  );
}
