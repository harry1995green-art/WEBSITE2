import { execSync } from "child_process";
import { prisma } from "./prisma";
import { hashPassword } from "./auth";

export function runMigrations() {
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } catch (err) {
    console.error("prisma migrate deploy failed:", err);
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

  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME;
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
