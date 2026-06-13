import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AuditActions, logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { users } from "../../../../../../drizzle/schema";

export async function POST(request: Request) {
  try {
    const session = await requirePermission("users.manage");
    const { action, targetUserId, email, name } = await request.json();

    if (
      !targetUserId ||
      !["create", "delete"].includes(action) ||
      !email ||
      !name
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const actor = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isCreate = action === "create";
    await logAudit({
      actorId: session.user.id,
      action: isCreate ? AuditActions.USER_CREATE : AuditActions.USER_DELETE,
      targetType: "user",
      targetId: targetUserId,
      summary: isCreate
        ? `${actor.name} created user ${name} (${email})`
        : `${actor.name} deleted user ${name} (${email})`,
      metadata: { email, name },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
