import Link from "next/link";
import { getSession } from "@/lib/auth-server";

export async function SiteHeader() {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          n8n<span className="text-accent">ify</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/workflows" className="text-muted hover:text-foreground">
            Workflows
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-muted hover:text-foreground"
              >
                Dashboard
              </Link>
              {(role === "creator" || role === "admin") && (
                <Link
                  href="/dashboard/seller"
                  className="text-muted hover:text-foreground"
                >
                  Sell
                </Link>
              )}
              {role === "admin" && (
                <Link href="/admin" className="text-muted hover:text-foreground">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent-hover"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
