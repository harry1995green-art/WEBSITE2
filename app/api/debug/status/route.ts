import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Diagnostic endpoint for confirming the database is reachable and seeded.
// Visit /api/debug/status?key=<CRM_API_KEY> in a browser.
export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key || key !== process.env.CRM_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orgs, leadCount, jobCount, contactCount] = await Promise.all([
    prisma.organization.findMany({ select: { slug: true, name: true } }),
    prisma.lead.count(),
    prisma.job.count(),
    prisma.contact.count(),
  ]);

  return NextResponse.json({ orgs, leadCount, jobCount, contactCount });
}
