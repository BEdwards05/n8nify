import { createAccessControl } from "better-auth/plugins";

const statements = {
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
} as const;

export const adminAccessControl = createAccessControl(statements);

const noPermissions = adminAccessControl.newRole({
  user: [],
  session: [],
});

export const adminPluginRole = adminAccessControl.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
});

export const authAdminPluginOptions = {
  defaultRole: "buyer",
  adminRoles: ["admin"],
  ac: adminAccessControl,
  roles: {
    admin: adminPluginRole,
    buyer: noPermissions,
    creator: noPermissions,
    moderator: noPermissions,
  },
  impersonationSessionDuration: 60 * 60,
};
