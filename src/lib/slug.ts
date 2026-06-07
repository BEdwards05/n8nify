import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base}-${nanoid()}`;
}

export function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "creator";
  return local.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "creator";
}
