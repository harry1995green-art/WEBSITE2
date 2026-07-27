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

  const leads = await prisma.lead.findMany({
    where: { orgId: result.org.id },
    include: { contact: true, job: { select: { id: true, stage: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const result = await getOrgOrError(body.org ?? new URL(req.url).searchParams.get("org"));
  if ("error" in result) return result.error;

  const contact = body.contact?.name
    ? await findOrCreateContact(result.org.id, {
        name: body.contact.name,
        email: body.contact.email ?? null,
        phone: body.contact.phone ?? null,
        address: body.contact.address ?? null,
      })
    : null;

  const lead = await prisma.lead.create({
    data: {
      orgId: result.org.id,
      contactId: contact?.id ?? null,
      title: body.title || `Enquiry from ${contact?.name ?? "unknown contact"}`,
      source: body.source ?? null,
      value: typeof body.value === "number" ? body.value : null,
      notes: body.notes ?? null,
    },
    include: { contact: true },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
