import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey, getOrgOrError } from "@/lib/apiAuth";
import { findOrCreateContact } from "@/lib/crm";

export async function GET(req: NextRequest) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const result = await getOrgOrError(searchParams.get("org"));
  if ("error" in result) return result.error;

  const contacts = await prisma.contact.findMany({
    where: { orgId: result.org.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const result = await getOrgOrError(body.org ?? new URL(req.url).searchParams.get("org"));
  if ("error" in result) return result.error;

  if (!body.name) {
    return NextResponse.json({ error: "'name' is required" }, { status: 400 });
  }

  const contact = await findOrCreateContact(result.org.id, {
    name: body.name,
    email: body.email ?? null,
    phone: body.phone ?? null,
    address: body.address ?? null,
  });

  return NextResponse.json({ contact }, { status: 201 });
}
