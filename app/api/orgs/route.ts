import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const orgs = await prisma.organization.findMany({ select: { id: true, slug: true, name: true } });
  return NextResponse.json({ orgs });
}
