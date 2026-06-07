import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  creatorProfiles,
  listingCategories,
  listings,
  users,
} from "../../../../drizzle/schema";
import { slugify } from "@/lib/slug";
import { processWorkflowUpload } from "@/lib/workflow-service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "creator" && role !== "admin") {
    return NextResponse.json({ error: "Creator role required" }, { status: 403 });
  }

  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, session.user.id),
  });
  if (!profile) {
    return NextResponse.json({ error: "Complete creator onboarding" }, { status: 400 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const priceCents = Number(formData.get("priceCents") ?? 0);
  const categoryIds = JSON.parse(String(formData.get("categoryIds") ?? "[]")) as string[];
  const submitForReview = formData.get("submitForReview") === "true";
  const workflowFile = formData.get("workflow") as File | null;

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description required" }, { status: 400 });
  }
  if (!workflowFile) {
    return NextResponse.json({ error: "Workflow JSON required" }, { status: 400 });
  }

  const slug = slugify(title);
  const [listing] = await db
    .insert(listings)
    .values({
      slug,
      creatorId: session.user.id,
      title,
      description,
      priceCents: Math.max(0, priceCents),
      status: submitForReview ? "pending" : "draft",
    })
    .returning();

  const rawJson = await workflowFile.text();
  try {
    await processWorkflowUpload(listing.id, rawJson);
  } catch (e) {
    await db.delete(listings).where(eq(listings.id, listing.id));
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid workflow" },
      { status: 400 },
    );
  }

  if (categoryIds.length > 0) {
    await db.insert(listingCategories).values(
      categoryIds.map((categoryId) => ({
        listingId: listing.id,
        categoryId,
      })),
    );
  }

  return NextResponse.json({ id: listing.id, slug: listing.slug });
}
