import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { creatorProfiles } from "../../../../../drizzle/schema";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { displayName, username, bio } = await request.json();

    const profile = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, session.user.id),
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 404 },
      );
    }

    const cleanUsername = String(username)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    const taken = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.username, cleanUsername),
    });
    if (taken && taken.userId !== session.user.id) {
      return NextResponse.json({ error: "Username taken" }, { status: 400 });
    }

    const [updated] = await db
      .update(creatorProfiles)
      .set({
        displayName: displayName ?? profile.displayName,
        username: cleanUsername,
        bio: bio ?? "",
        updatedAt: new Date(),
      })
      .where(eq(creatorProfiles.userId, session.user.id))
      .returning();

    return NextResponse.json({ profile: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
