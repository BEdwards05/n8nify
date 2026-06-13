import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db";
import { auditLog, users } from "../../../drizzle/schema";

export type AuditLogFilters = {
  q?: string;
  actorId?: string;
  action?: string;
  page?: number;
  limit?: number;
};

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters.q) {
    conditions.push(
      or(
        ilike(auditLog.summary, `%${filters.q}%`),
        ilike(auditLog.targetId, `%${filters.q}%`),
        ilike(users.name, `%${filters.q}%`),
        ilike(users.email, `%${filters.q}%`),
      )!,
    );
  }
  if (filters.actorId) {
    conditions.push(eq(auditLog.actorId, filters.actorId));
  }
  if (filters.action && filters.action !== "all") {
    conditions.push(eq(auditLog.action, filters.action));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      entry: auditLog,
      actor: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(auditLog)
    .innerJoin(users, eq(auditLog.actorId, users.id))
    .where(where)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(auditLog)
    .innerJoin(users, eq(auditLog.actorId, users.id))
    .where(where);

  return { items: rows, total, page, limit };
}

export async function getAuditActors() {
  return db
    .selectDistinct({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(auditLog)
    .innerJoin(users, eq(auditLog.actorId, users.id))
    .orderBy(users.name);
}

export async function getAuditActions() {
  const rows = await db
    .selectDistinct({ action: auditLog.action })
    .from(auditLog)
    .orderBy(auditLog.action);
  return rows.map((row) => row.action);
}
