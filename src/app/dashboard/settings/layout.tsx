import { redirect } from "next/navigation";
import { SettingsSubnav } from "@/components/settings-subnav";
import { getSession } from "@/lib/auth-server";
import { ROLE_LABELS, parseRole } from "@/lib/permissions";
import { getUserById } from "@/lib/queries/users";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getUserById(session.user.id);
  if (!data) redirect("/login");

  const role = parseRole(data.user.role);
  const initials = data.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const twoFactorEnabled = Boolean(
    (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="section-label mb-3">Account</p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface font-display text-lg font-semibold text-accent">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {data.user.name}
            </h1>
            <p className="mt-0.5 truncate text-sm text-muted">{data.user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip capitalize">{ROLE_LABELS[role]}</span>
              <span className="chip">
                Joined {data.user.createdAt.toLocaleDateString()}
              </span>
              <span className="chip">
                {data.purchaseCount} purchase
                {data.purchaseCount === 1 ? "" : "s"}
              </span>
              {(role === "creator" || role === "admin") && (
                <span className="chip">
                  {data.listingCount} listing
                  {data.listingCount === 1 ? "" : "s"}
                </span>
              )}
              {twoFactorEnabled && (
                <span className="chip text-accent">2FA enabled</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <SettingsSubnav />
      <div className="pt-8">{children}</div>
    </div>
  );
}
