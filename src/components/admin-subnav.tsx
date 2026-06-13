import { Subnav } from "@/components/subnav";
import { can, parseRole } from "@/lib/permissions";

const allItems = [
  { href: "/admin", label: "Moderation", exact: true, permission: "listings.moderate" as const },
  { href: "/admin/users", label: "Users", permission: "users.manage" as const },
  { href: "/admin/audit", label: "Audit log", permission: "audit.read" as const },
];

export function AdminSubnav({ role }: { role?: string }) {
  const parsed = parseRole(role);
  const items = allItems
    .filter((item) => can(parsed, item.permission))
    .map(({ permission: _, ...item }) => item);

  if (items.length <= 1) return null;

  return <Subnav items={items} />;
}
