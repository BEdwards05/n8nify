import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AuditActions, logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { ROLE_LABELS, parseRole } from "@/lib/permissions";
import { users } from "../../../../../../drizzle/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requirePermission("users.manage");
    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account here" },
        { status: 400 },
      );
    }

    const { role, banned } = await request.json();
    const target = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const actor = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patch: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (role && ["buyer", "creator", "moderator", "admin"].includes(role)) {
      if (role !== target.role) {
        patch.role = role as typeof target.role;
      }
    }

    if (typeof banned === "boolean") {
      patch.banned = banned;
    }

    if (Object.keys(patch).length === 1) {
      return NextResponse.json({ user: target });
    }

    const [updated] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning();

    if (role && role !== target.role) {
      await logAudit({
        actorId: session.user.id,
        action: AuditActions.USER_ROLE_CHANGE,
        targetType: "user",
        targetId: id,
        summary: `${actor.name} changed ${target.name}'s role from ${ROLE_LABELS[parseRole(target.role)]} to ${ROLE_LABELS[parseRole(role)]}`,
        metadata: { from: target.role, to: role },
      });
    }

    if (typeof banned === "boolean" && banned !== target.banned) {
      await logAudit({
        actorId: session.user.id,
        action: banned ? AuditActions.USER_BAN : AuditActions.USER_UNBAN,
        targetType: "user",
        targetId: id,
        summary: banned
          ? `${actor.name} banned ${target.name} (${target.email})`
          : `${actor.name} unbanned ${target.name} (${target.email})`,
        metadata: { banned },
      });
    }

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
