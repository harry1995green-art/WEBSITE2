import { execSync } from "child_process";
import { prisma } from "./prisma";
import { hashPassword } from "./auth";

// Uses `db push` rather than `migrate deploy` — it syncs the schema
// directly instead of matching migration file names against a history
// table, which is more forgiving on databases that were bootstrapped
// out-of-band (e.g. a retried/partial deploy) and don't have a matching
// migration name recorded.
export function runMigrations() {
  try {
    execSync("npx prisma db push --accept-data-loss --skip-generate", { stdio: "inherit" });
  } catch (err) {
    console.error("prisma db push failed:", err);
  }
}

export async function ensureSeedData() {
  await prisma.organization.upsert({
    where: { slug: "AR" },
    update: {},
    create: { slug: "AR", name: "Artisanic Roofing" },
  });
  await prisma.organization.upsert({
    where: { slug: "BA" },
    update: {},
    create: { slug: "BA", name: "Ballers Abroad" },
  });

  // Trim + lowercase to match how the login form normalizes the email it's
  // given (lib/login/actions.ts) — otherwise stray whitespace or casing in
  // the ADMIN_EMAIL env var silently creates a user that can never match.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (email && name && password) {
    const passwordHash = await hashPassword(password);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { email, name, passwordHash },
    });
  }
}
