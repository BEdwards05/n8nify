import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import {
  getSession,
  getUserRole,
  requirePermission,
} from "@/lib/auth-server";
import { getUserById } from "@/lib/queries/users";
import { roleRequiresMfa } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getUserById(session.user.id);
  if (!data) redirect("/login");
  if (data.user.banned) redirect("/banned");

  try {
    await requirePermission("admin.access");
  } catch {
    redirect("/dashboard");
  }

  const role = getUserRole(session.user);
  const twoFactorEnabled = Boolean(
    (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
  );
  if (roleRequiresMfa(role) && !twoFactorEnabled) {
    redirect("/dashboard/settings/security?required=1");
  }

  return (
    <div className="page-shell py-12 md:py-16">
      <DashboardNav role={role} variant="admin" />
      <div className="mt-8">{children}</div>
    </div>
  );
}
