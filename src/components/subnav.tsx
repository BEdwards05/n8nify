"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SubnavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function Subnav({ items }: { items: SubnavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 border-b border-line">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`-mb-px border-b-2 py-2.5 text-sm transition ${
              active
                ? "border-accent font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
