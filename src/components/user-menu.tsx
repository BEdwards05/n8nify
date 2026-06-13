"use client";

import Link from "next/link";
import { can, parseRole } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Props = {
  name: string;
  email: string;
  role?: string;
};

export function UserMenu({ name, email, role }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const parsedRole = parseRole(role);
  const showSeller = can(parsedRole, "listings.create");
  const showModeration = can(parsedRole, "listings.moderate");
  const showUsers = can(parsedRole, "users.manage");
  const showAudit = can(parsedRole, "audit.read");
  const showAdminSection = showModeration || showUsers || showAudit;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 transition hover:bg-surface-hover"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accent">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate text-sm sm:inline">
          {name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-elevated py-2 shadow-xl">
          <div className="border-b border-line px-4 pb-3 pt-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
            {role && (
              <p className="mt-1 text-xs capitalize text-muted-dim">{role}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Purchases
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            {showSeller && (
              <Link
                href="/dashboard/seller"
                className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Seller dashboard
              </Link>
            )}
            {showAdminSection && (
              <>
                <div className="my-1 border-t border-line" />
                <p className="px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-dim">
                  Admin
                </p>
                {showModeration && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Moderation
                  </Link>
                )}
                {showUsers && (
                  <Link
                    href="/admin/users"
                    className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Users
                  </Link>
                )}
                {showAudit && (
                  <Link
                    href="/admin/audit"
                    className="block px-4 py-2 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Audit log
                  </Link>
                )}
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
