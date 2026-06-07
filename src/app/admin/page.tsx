import { redirect } from "next/navigation";
import { AdminQueue } from "@/components/admin-queue";
import { getSession } from "@/lib/auth-server";
import { getPendingListings } from "@/lib/queries/listings";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") redirect("/dashboard");

  const pending = await getPendingListings();

  return (
    <div className="page-shell py-12 md:py-16">
      <p className="section-label mb-2">Moderation</p>
      <h1 className="font-display text-3xl font-bold">Review queue</h1>
      <p className="mt-1 text-muted">{pending.length} pending</p>
      <div className="mt-10">
        <AdminQueue items={pending} />
      </div>
    </div>
  );
}
