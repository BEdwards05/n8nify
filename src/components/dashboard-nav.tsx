import Link from "next/link";
import { can, parseRole, type Permission } from "@/lib/permissions";

const dashboardLinks = [
  { href: "/dashboard", label: "Purchases" },
  { href: "/dashboard/settings", label: "Settings" },
];

const sellerLinks = [
  { href: "/dashboard/seller", label: "Listings" },
  { href: "/dashboard/seller/new", label: "New listing" },
];

const adminLinks: Array<{
  href: string;
  label: string;
  permission: Permission;
}> = [
  {
    href: "/admin",
    label: "Moderation",
    permission: "listings.moderate",
  },
  {
    href: "/admin/users",
    label: "Users",
    permission: "users.manage",
  },
  {
    href: "/admin/audit",
    label: "Audit log",
    permission: "audit.read",
  },
];

type Props = {
  role?: string;
  variant: "dashboard" | "admin";
};

export function DashboardNav({ role: roleValue, variant }: Props) {
  const role = parseRole(roleValue);
  const visibleAdminLinks = adminLinks.filter((item) => can(role, item.permission));
  const showSeller = can(role, "listings.create");

  const items =
    variant === "admin"
      ? visibleAdminLinks
      : [
          ...dashboardLinks,
          ...(showSeller ? sellerLinks : []),
          ...visibleAdminLinks,
        ];

  if (items.length === 0) return null;

  const dashboardCount = dashboardLinks.length + (showSeller ? sellerLinks.length : 0);
  const hasAdminSection = visibleAdminLinks.length > 0 && variant === "dashboard";

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-line pb-4">
      {items.map((item, index) => (
        <span key={item.href} className="contents">
          {hasAdminSection && index === dashboardCount && (
            <span
              className="mx-1 hidden h-4 w-px bg-line sm:inline"
              aria-hidden
            />
          )}
          <Link
            href={item.href}
            className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
