import { headers } from "next/headers";
import { auth } from "./auth";
import {
  can,
  parseRole,
  type Permission,
  type Role,
} from "./permissions";

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

export function getUserRole(user: { role?: string }): Role {
  return parseRole(user.role);
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  const role = getUserRole(session.user);
  if (!roles.includes(role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  const role = getUserRole(session.user);
  if (!can(role, permission)) {
    throw new Error("Forbidden");
  }
  return session;
}
