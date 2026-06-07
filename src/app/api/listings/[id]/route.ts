import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { listingCategories, listings } from "../../../../../drizzle/schema";
import { processWorkflowUpload } from "@/lib/workflow-service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
  });
  if (!listing || listing.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? listing.title);
  const description = String(formData.get("description") ?? listing.description);
  const priceCents = Number(formData.get("priceCents") ?? listing.priceCents);
  const categoryIds = JSON.parse(
    String(formData.get("categoryIds") ?? "[]"),
  ) as string[];
  const submitForReview = formData.get("submitForReview") === "true";
  const workflowFile = formData.get("workflow") as File | null;

  let status = listing.status;
  if (submitForReview && listing.status !== "published") {
    status = "pending";
  }

  await db
    .update(listings)
    .set({
      title,
      description,
      priceCents: Math.max(0, priceCents),
      status,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id));

  if (workflowFile && workflowFile.size > 0) {
    try {
      await processWorkflowUpload(id, await workflowFile.text());
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid workflow" },
        { status: 400 },
      );
    }
  }

  await db.delete(listingCategories).where(eq(listingCategories.listingId, id));
  if (categoryIds.length > 0) {
    await db.insert(listingCategories).values(
      categoryIds.map((categoryId) => ({
        listingId: id,
        categoryId,
      })),
    );
  }

  return NextResponse.json({ success: true });
}
