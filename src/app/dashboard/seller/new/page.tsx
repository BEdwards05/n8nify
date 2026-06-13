import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { getSession } from "@/lib/auth-server";
import { getAllCategories } from "@/lib/queries/listings";

export const metadata = { title: "New listing" };

export default async function NewListingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const categories = await getAllCategories();

  return (
    <>
      <p className="section-label mb-2">New</p>
      <h1 className="font-display text-3xl font-bold">List a workflow</h1>
      <div className="mt-10">
        <ListingForm categories={categories} />
      </div>
    </>
  );
}
