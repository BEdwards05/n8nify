import { NextResponse } from "next/server";
import { AuditActions, logAudit } from "@/lib/audit";
import { getSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();
  const user = session.user;

  if (action === "enable") {
    await logAudit({
      actorId: user.id,
      action: AuditActions.MFA_ENABLE,
      targetType: "user",
      targetId: user.id,
      summary: `${user.name} enabled two-factor authentication`,
    });
  } else if (action === "disable") {
    await logAudit({
      actorId: user.id,
      action: AuditActions.MFA_DISABLE,
      targetType: "user",
      targetId: user.id,
      summary: `${user.name} disabled two-factor authentication`,
    });
  } else if (action === "regenerate_backup_codes") {
    await logAudit({
      actorId: user.id,
      action: AuditActions.MFA_BACKUP_CODES,
      targetType: "user",
      targetId: user.id,
      summary: `${user.name} regenerated two-factor backup codes`,
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
