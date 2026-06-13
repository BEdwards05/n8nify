import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { getSession } from "@/lib/auth-server";
import { getUserById } from "@/lib/queries/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getUserById(session.user.id);
  if (!data) redirect("/login");
  if (data.user.banned) redirect("/banned");

  const role = data.user.role;

  return (
    <div className="page-shell py-12 md:py-16">
      <DashboardNav role={role} variant="dashboard" />
      <div className="mt-8">{children}</div>
    </div>
  );
}
