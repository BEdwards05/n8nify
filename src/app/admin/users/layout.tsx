import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth-server";

export default async function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requirePermission("users.manage");
  } catch {
    redirect("/admin");
  }

  return children;
}
