import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Temporary diagnostic endpoint for verifying the seed/login setup on a
// fresh deployment. Visit /api/debug/status?key=<CRM_API_KEY> in a browser.
// Never returns password hashes or the raw ADMIN_PASSWORD. Remove this
// route once deployment issues are resolved.
export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key || key !== process.env.CRM_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orgCount, userCount, orgs] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.organization.findMany({ select: { slug: true, name: true } }),
  ]);

  const adminEmailEnv = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? null;
  const adminUser = adminEmailEnv
    ? await prisma.user.findUnique({ where: { email: adminEmailEnv } })
    : null;

  return NextResponse.json({
    orgCount,
    orgs,
    userCount,
    adminEmailEnv,
    adminUserFoundInDb: Boolean(adminUser),
    adminUserEmailInDb: adminUser?.email ?? null,
    passwordHashLooksValid: adminUser ? adminUser.passwordHash.startsWith("$2") : null,
    envVarsPresent: {
      ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
      ADMIN_NAME: Boolean(process.env.ADMIN_NAME),
      ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
    },
  });
}
