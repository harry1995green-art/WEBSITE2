import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

export function requireApiKey(req: NextRequest): NextResponse | null {
  const auth = req.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const expected = process.env.CRM_API_KEY;
  if (!expected || !key || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function resolveOrgSlug(value: string | null): "AR" | "BA" | null {
  if (value === "AR" || value === "BA") return value;
  return null;
}

export async function getOrgOrError(slugValue: string | null) {
  const slug = resolveOrgSlug(slugValue);
  if (!slug) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid 'org' — must be 'AR' or 'BA'" },
        { status: 400 },
      ),
    } as const;
  }
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) {
    return {
      error: NextResponse.json({ error: `Organization '${slug}' not found` }, { status: 404 }),
    } as const;
  }
  return { org } as const;
}
