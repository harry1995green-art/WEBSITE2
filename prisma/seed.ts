import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { email, name, passwordHash },
    });
    console.log(`Seeded login user: ${email}`);
  } else {
    console.warn(
      "ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD not set — skipped creating a login user. Set them in .env and re-run.",
    );
  }

  console.log("Seeded organizations: Artisanic Roofing (AR), Ballers Abroad (BA)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
