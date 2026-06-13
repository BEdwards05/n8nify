import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { AuditActions, logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { verifyMfaStepUp } from "@/lib/mfa-step-up";
import { users } from "../../../../../drizzle/schema";

export async function POST(request: Request) {
  try {
    const session = await requirePermission("users.manage");
    const requestHeaders = await headers();
    const { targetUserId, code, codeType } = await request.json();

    if (
      !targetUserId ||
      !code ||
      !["totp", "backup"].includes(codeType)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const actor = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!actor.twoFactorEnabled) {
      return NextResponse.json(
        {
          error:
            "Two-factor authentication must be enabled before impersonating users.",
        },
        { status: 403 },
      );
    }

    const target = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.id === actor.id) {
      return NextResponse.json(
        { error: "You cannot impersonate yourself." },
        { status: 400 },
      );
    }

    if (target.banned) {
      return NextResponse.json(
        { error: "Cannot impersonate a banned user." },
        { status: 400 },
      );
    }

    try {
      await verifyMfaStepUp(requestHeaders, code, codeType);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid verification code";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    try {
      await auth.api.impersonateUser({
        body: { userId: targetUserId },
        headers: requestHeaders,
      });
    } catch (error) {
      const message =
        error instanceof APIError
          ? error.message
          : "Failed to impersonate user";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    await logAudit({
      actorId: actor.id,
      action: AuditActions.USER_IMPERSONATE_START,
      targetType: "user",
      targetId: targetUserId,
      summary: `${actor.name} started impersonating ${target.name} (${target.email})`,
      metadata: { targetUserId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
