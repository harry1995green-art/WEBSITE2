import { prisma } from "../lib/prisma";
import { ensureSeedData } from "../lib/bootstrap";

async function main() {
  await ensureSeedData();

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_NAME || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD not set — skipped creating a login user. Set them in .env and re-run.",
    );
  } else {
    console.log(`Seeded login user: ${process.env.ADMIN_EMAIL}`);
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
