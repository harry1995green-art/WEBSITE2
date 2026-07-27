// Runs once per server start (Next.js instrumentation hook). On hosts like
// Railway/Render this applies pending Prisma migrations and makes sure the
// AR/BA orgs + the admin login user (from env vars) exist, so a fresh
// deploy is immediately usable without a manual shell step.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.SKIP_BOOTSTRAP === "true") return;

  const { runMigrations, ensureSeedData } = await import("./lib/bootstrap");
  runMigrations();
  await ensureSeedData().catch((err) => {
    console.error("Bootstrap seeding failed:", err);
  });
}
