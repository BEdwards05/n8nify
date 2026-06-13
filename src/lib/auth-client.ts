import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { authAdminPluginOptions } from "./auth-admin";

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
    adminClient({
      ac: authAdminPluginOptions.ac,
      roles: authAdminPluginOptions.roles,
    }),
  ],
});
