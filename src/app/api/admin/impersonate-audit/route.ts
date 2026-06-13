import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AuditActions, logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { users } from "../../../../../drizzle/schema";

export async function POST(request: Request) {
  try {
    const session = await requirePermission("users.manage");
    const { targetUserId, action } = await request.json();

    if (!targetUserId || !["start", "stop"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (action === "start") {
      return NextResponse.json(
        { error: "Use /api/admin/impersonate to start impersonation." },
        { status: 400 },
      );
    }

    const actor = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    const target = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });
    if (!actor || !target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logAudit({
      actorId: session.user.id,
      action: AuditActions.USER_IMPERSONATE_STOP,
      targetType: "user",
      targetId: targetUserId,
      summary: `${actor.name} stopped impersonating ${target.name} (${target.email})`,
      metadata: { targetUserId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
