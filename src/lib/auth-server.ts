import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(roles: Array<"buyer" | "creator" | "admin">) {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role ?? "buyer";
  if (!roles.includes(role as "buyer" | "creator" | "admin")) {
    throw new Error("Forbidden");
  }
  return session;
}
