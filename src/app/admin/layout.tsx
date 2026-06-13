import { redirect } from "next/navigation";
import { AdminSubnav } from "@/components/admin-subnav";
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
    <div className="page-shell py-10 md:py-14">
      <AdminSubnav role={data.user.role} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
