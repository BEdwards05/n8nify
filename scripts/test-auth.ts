import { config } from "dotenv";
config({ path: ".env.local" });

const base = process.env.APP_URL ?? "http://localhost:3001";
const email = process.env.SEED_ADMIN_EMAIL ?? "admin@n8nify.io";
const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

async function main() {
  const res = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  console.log("status:", res.status);
  console.log("body:", text.slice(0, 500));
}

main().catch(console.error);
