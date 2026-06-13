import { eq } from "drizzle-orm";
import { getSession } from "./auth-server";
import { db } from "./db";
import { users } from "../../drizzle/schema";

export async function getImpersonationState() {
  const session = await getSession();
  if (!session) return null;

  const impersonatedBy = (
    session.session as { impersonatedBy?: string | null }
  ).impersonatedBy;
  if (!impersonatedBy) return null;

  const admin = await db.query.users.findFirst({
    where: eq(users.id, impersonatedBy),
    columns: { id: true, name: true, email: true },
  });

  return {
    admin,
    viewingAs: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
  };
}
