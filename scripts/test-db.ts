import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  const r = await sql`SELECT 1 as x`;
  console.log("connected", r);
  await sql.end();
}

main().catch(console.error);
