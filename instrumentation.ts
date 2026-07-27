// Runs once per server start (Next.js instrumentation hook). On hosts like
// Railway/Render this applies pending Prisma migrations and makes sure the
// AR/BA orgs + the admin login user (from env vars) exist, so a fresh
// deploy is immediately usable without a manual shell step.
//
// On Vercel, migrations run once at build time instead (see the
// "vercel-build" script in package.json) — running `prisma migrate deploy`
// on every serverless cold start would be wasteful and can race across
// concurrent invocations, so it's skipped there. Seeding is still safe to
// run here since it's a set of idempotent upserts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.SKIP_BOOTSTRAP === "true") return;

  const { runMigrations, ensureSeedData } = await import("./lib/bootstrap");
  if (!process.env.VERCEL) runMigrations();
  await ensureSeedData().catch((err) => {
    console.error("Bootstrap seeding failed:", err);
  });
}
