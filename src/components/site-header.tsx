import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { getSession } from "@/lib/auth-server";

export async function SiteHeader() {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/75 backdrop-blur-xl">
      <div className="page-shell flex h-[3.75rem] items-center justify-between">
        <BrandLogo />
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/workflows"
            className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            Workflows
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                Dashboard
              </Link>
              {(role === "creator" || role === "admin") && (
                <Link
                  href="/dashboard/seller"
                  className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
                >
                  Sell
                </Link>
              )}
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary ml-1">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
