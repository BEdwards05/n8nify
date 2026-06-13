export type Role = "buyer" | "creator" | "moderator" | "admin";

export type Permission =
  | "purchases.read"
  | "listings.create"
  | "listings.edit_own"
  | "listings.moderate"
  | "users.read"
  | "users.manage"
  | "audit.read"
  | "admin.access";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  buyer: ["purchases.read"],
  creator: ["purchases.read", "listings.create", "listings.edit_own"],
  moderator: [
    "purchases.read",
    "listings.moderate",
    "users.read",
    "audit.read",
    "admin.access",
  ],
  admin: [
    "purchases.read",
    "listings.create",
    "listings.edit_own",
    "listings.moderate",
    "users.read",
    "users.manage",
    "audit.read",
    "admin.access",
  ],
};

export function parseRole(value: string | undefined | null): Role {
  if (
    value === "creator" ||
    value === "moderator" ||
    value === "admin"
  ) {
    return value;
  }
  return "buyer";
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function roleRequiresMfa(role: Role): boolean {
  return role === "admin" || role === "moderator";
}

export const ROLE_LABELS: Record<Role, string> = {
  buyer: "Buyer",
  creator: "Creator",
  moderator: "Moderator",
  admin: "Admin",
};
