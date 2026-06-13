"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { can, parseRole, ROLE_LABELS } from "@/lib/permissions";

type Props = {
  name: string;
  email: string;
  role?: string;
};

export function UserMenu({ name, email, role }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsedRole = parseRole(role);
  const showSelling = can(parsedRole, "listings.create");
  const showAdmin = can(parsedRole, "admin.access");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = role ? ROLE_LABELS[parsedRole] : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-xs font-medium text-accent transition hover:border-line-strong hover:bg-surface-hover"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-elevated py-2 shadow-xl">
          <div className="border-b border-line px-4 pb-3 pt-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
            {roleLabel && (
              <p className="mt-1 text-xs text-muted-dim">{roleLabel}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            {showSelling && (
              <Link
                href="/dashboard/seller"
                className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Selling
              </Link>
            )}
            {showAdmin && (
              <>
                <div className="my-1 border-t border-line" />
                <Link
                  href="/admin/users"
                  className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Manage users
                </Link>
                <Link
                  href="/admin/audit"
                  className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Audit log
                </Link>
              </>
            )}
          </div>
          <div className="border-t border-line pt-1">
            <button
              type="button"
              onClick={signOut}
              className="block w-full px-4 py-2 text-left text-sm text-muted hover:bg-surface-hover hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
