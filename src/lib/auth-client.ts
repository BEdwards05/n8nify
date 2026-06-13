import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

function getAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
  ],
});
