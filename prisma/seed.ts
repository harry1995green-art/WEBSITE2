import { prisma } from "../lib/prisma";
import { ensureSeedData } from "../lib/bootstrap";

async function main() {
  await ensureSeedData();
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
