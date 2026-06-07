import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { creatorProfiles, users } from "../../../../../drizzle/schema";
import { usernameFromEmail } from "@/lib/slug";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const displayName = body.displayName ?? session.user.name;
  let username = (body.username ?? usernameFromEmail(session.user.email))
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  const bio = body.bio ?? "";

  if (username.length < 3) username = `creator_${session.user.id.slice(0, 6)}`;

  const existing = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, session.user.id),
  });
  if (existing) {
    return NextResponse.json({ success: true, profile: existing });
  }

  const taken = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.username, username),
  });
  if (taken) {
    username = `${username}_${session.user.id.slice(0, 4)}`;
  }

  const [profile] = await db
    .insert(creatorProfiles)
    .values({
      userId: session.user.id,
      username,
      displayName,
      bio,
    })
    .returning();

  await db
    .update(users)
    .set({ role: "creator", updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true, profile });
}
