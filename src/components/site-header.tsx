import Link from "next/link";
import { eq } from "drizzle-orm";
import { LoggedInHeader } from "@/components/logged-in-header";
import { BrandLogo } from "@/components/brand-logo";
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

  if (session) {
    return (
      <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-xl">
        <div className="page-shell grid grid-cols-[auto_1fr_auto] items-center gap-x-4 md:h-14">
          <LoggedInHeader
            name={session.user.name}
            email={session.user.email}
            role={role}
          />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-xl">
      <div className="page-shell flex h-14 items-center gap-4">
        <BrandLogo />
        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/workflows"
            className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            Workflows
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            Sign in
          </Link>
          <Link href="/register" className="btn btn-primary">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
