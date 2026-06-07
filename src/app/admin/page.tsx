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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Moderation queue</h1>
      <p className="mb-8 text-muted">{pending.length} listings pending review</p>
      <AdminQueue items={pending} />
    </div>
  );
}
