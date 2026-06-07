import { createAuthClient } from "better-auth/react";

function getAuthBaseURL(): string {
  // Always use the current origin in the browser so auth hits the same
  // server you're viewing (avoids port 3000 vs 3001 mismatches locally).
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});
