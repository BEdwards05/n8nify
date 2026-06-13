"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { LoggedInMobileNav, LoggedInNav } from "@/components/logged-in-nav";
import { UserMenu } from "@/components/user-menu";

type Props = {
  name: string;
  email: string;
  role?: string;
};

export function LoggedInHeader({ name, email, role }: Props) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  return (
    <div className="contents">
      <BrandLogo className="py-3 md:py-0" />
      <div className="flex items-center justify-center">
        <LoggedInNav role={role} />
      </div>
      <div className="flex items-center justify-end gap-2 py-3 md:py-0">
        <button
          type="button"
          onClick={() => setMobileNav(!mobileNav)}
          className="rounded-lg px-2.5 py-1.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground md:hidden"
          aria-expanded={mobileNav}
        >
          Menu
        </button>
        <UserMenu name={name} email={email} role={role} />
      </div>
      <LoggedInMobileNav
        role={role}
        open={mobileNav}
        onClose={() => setMobileNav(false)}
        className="col-span-full"
      />
    </div>
  );
}
