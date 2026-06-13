"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { can, parseRole } from "@/lib/permissions";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

function buildPrimaryNav(roleValue?: string): NavItem[] {
  const role = parseRole(roleValue);
  const items: NavItem[] = [
    {
      href: "/workflows",
      label: "Workflows",
      match: (p) => p === "/workflows" || p.startsWith("/workflows/"),
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      match: (p) => p.startsWith("/dashboard"),
    },
  ];

  if (can(role, "admin.access")) {
    items.push({
      href: "/admin",
      label: "Admin",
      match: (p) => p.startsWith("/admin"),
    });
  }

  return items;
}

function NavLink({
  item,
  pathname,
  onNavigate,
  variant,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  variant: "header" | "drawer";
}) {
  const active = item.match(pathname);

  if (variant === "drawer") {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`block rounded-lg px-3 py-2.5 text-sm ${
          active
            ? "bg-surface-hover font-medium text-foreground"
            : "text-muted hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`relative px-1 py-4 text-sm transition ${
        active
          ? "font-medium text-foreground"
          : "text-muted hover:text-foreground"
      }`}
    >
      {item.label}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
      )}
    </Link>
  );
}

export function LoggedInNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const items = buildPrimaryNav(role);

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          variant="header"
        />
      ))}
    </nav>
  );
}

export function LoggedInMobileNav({
  role,
  open,
  onClose,
  className = "",
}: {
  role?: string;
  open: boolean;
  onClose: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const items = buildPrimaryNav(role);

  if (!open) return null;

  return (
    <div
      className={`border-t border-line bg-elevated md:hidden ${className}`}
    >
      <div className="flex flex-col gap-1 py-2">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onClose}
            variant="drawer"
          />
        ))}
      </div>
    </div>
  );
}
