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

  const stage = searchParams.get("stage") ?? undefined;

  const jobs = await prisma.job.findMany({
    where: { orgId: result.org.id, ...(stage ? { stage } : {}) },
    include: { contact: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const result = await getOrgOrError(body.org ?? new URL(req.url).searchParams.get("org"));
  if ("error" in result) return result.error;

  if (!body.title) {
    return NextResponse.json({ error: "'title' is required" }, { status: 400 });
  }

  const contact = body.contact?.name
    ? await findOrCreateContact(result.org.id, {
        name: body.contact.name,
        email: body.contact.email ?? null,
        phone: body.contact.phone ?? null,
        address: body.contact.address ?? null,
      })
    : null;

  const job = await prisma.job.create({
    data: {
      orgId: result.org.id,
      contactId: contact?.id ?? null,
      title: body.title,
      address: body.address ?? contact?.address ?? null,
      value: typeof body.value === "number" ? body.value : null,
      stage: body.stage ?? "NEW_ENQUIRY",
      notes: body.notes ?? null,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
    },
    include: { contact: true },
  });
  await prisma.jobStageEvent.create({ data: { jobId: job.id, stage: job.stage } });

  return NextResponse.json({ job }, { status: 201 });
}
