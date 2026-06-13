import Link from "next/link";
import { eq } from "drizzle-orm";
import { BrandLogo } from "@/components/brand-logo";
import { UserMenu } from "@/components/user-menu";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { users } from "../../drizzle/schema";

export async function SiteHeader() {
  const session = await getSession();
  let role: string | undefined;

  if (session) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { role: true },
    });
    role = user?.role;
  }

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
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              role={role}
            />
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
