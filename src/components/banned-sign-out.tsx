"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function BannedSignOut() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className="btn btn-ghost mt-8">
      Sign out
    </button>
  );
}
