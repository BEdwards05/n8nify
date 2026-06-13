import { AdminQueue } from "@/components/admin-queue";
import { getPendingListings } from "@/lib/queries/listings";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const pending = await getPendingListings();

  return (
    <>
      <header className="mb-10">
        <p className="section-label mb-2">Moderation</p>
        <h1 className="font-display text-3xl font-bold">Review queue</h1>
        <p className="mt-1 text-muted">{pending.length} pending</p>
      </header>
      <AdminQueue items={pending} />
    </>
  );
}
