import { db } from "./db";
import { auditLog } from "../../drizzle/schema";

export const AuditActions = {
  USER_BAN: "user.ban",
  USER_UNBAN: "user.unban",
  USER_ROLE_CHANGE: "user.role_change",
  LISTING_APPROVE: "listing.approve",
  LISTING_REJECT: "listing.reject",
  MFA_ENABLE: "mfa.enable",
  MFA_DISABLE: "mfa.disable",
  MFA_BACKUP_CODES: "mfa.regenerate_backup_codes",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  [AuditActions.USER_BAN]: "User banned",
  [AuditActions.USER_UNBAN]: "User unbanned",
  [AuditActions.USER_ROLE_CHANGE]: "Role changed",
  [AuditActions.LISTING_APPROVE]: "Listing approved",
  [AuditActions.LISTING_REJECT]: "Listing rejected",
  [AuditActions.MFA_ENABLE]: "Two-factor enabled",
  [AuditActions.MFA_DISABLE]: "Two-factor disabled",
  [AuditActions.MFA_BACKUP_CODES]: "Backup codes regenerated",
};

type LogAuditInput = {
  actorId: string;
  action: AuditAction | string;
  targetType: string;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function logAudit(entry: LogAuditInput) {
  await db.insert(auditLog).values({
    actorId: entry.actorId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    summary: entry.summary,
    metadata: entry.metadata,
  });
}
