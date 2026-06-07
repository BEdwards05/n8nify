import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

const CATEGORIES = [
  { slug: "sales", name: "Sales", description: "CRM, leads, and pipeline automations" },
  { slug: "marketing", name: "Marketing", description: "Campaigns, social, and email" },
  { slug: "devops", name: "DevOps", description: "CI/CD, monitoring, and infra" },
  { slug: "ai", name: "AI", description: "LLM and AI agent workflows" },
  { slug: "ecommerce", name: "E-commerce", description: "Shopify, orders, and inventory" },
  { slug: "productivity", name: "Productivity", description: "Notion, tasks, and docs" },
];

async function seed() {
  for (const cat of CATEGORIES) {
    await db
      .insert(schema.categories)
      .values(cat)
      .onConflictDoNothing({ target: schema.categories.slug });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@n8nify.io";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });

  if (!existing) {
    const userId = crypto.randomUUID();
    const hashed = await hashPassword(adminPassword);

    await db.insert(schema.users).values({
      id: userId,
      name: "Admin",
      email: adminEmail,
      emailVerified: true,
      role: "admin",
    });

    await db.insert(schema.accounts).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashed,
    });

    console.info(`Admin created: ${adminEmail}`);
  } else {
    await db
      .update(schema.users)
      .set({ role: "admin" })
      .where(eq(schema.users.id, existing.id));
    console.info(`Admin exists: ${adminEmail}`);
  }

  console.info("Seed complete");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
