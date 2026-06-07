import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { listingCategories, listings } from "../../../../../../drizzle/schema";
import { getAllCategories } from "@/lib/queries/listings";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
  });
  if (!listing || listing.creatorId !== session.user.id) notFound();

  const categories = await getAllCategories();
  const selected = await db
    .select({ categoryId: listingCategories.categoryId })
    .from(listingCategories)
    .where(eq(listingCategories.listingId, id));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Edit listing</h1>
      <ListingForm
        categories={categories}
        listing={listing}
        selectedCategoryIds={selected.map((s) => s.categoryId)}
      />
    </div>
  );
}
