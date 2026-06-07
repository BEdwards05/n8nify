import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { getSession } from "@/lib/auth-server";
import { getAllCategories } from "@/lib/queries/listings";

export const metadata = { title: "New Listing" };

export default async function NewListingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold">New workflow listing</h1>
      <ListingForm categories={categories} />
    </div>
  );
}
