import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey, getOrgOrError } from "@/lib/apiAuth";
import { findOrCreateContact } from "@/lib/crm";

// Convenience endpoint for "every quote we do" — creates (or updates) a job
// at the QUOTE_SENT stage with a value, so it shows up in Finance & the pipeline.
export async function POST(req: NextRequest) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const result = await getOrgOrError(body.org ?? new URL(req.url).searchParams.get("org"));
  if ("error" in result) return result.error;

  if (typeof body.value !== "number") {
    return NextResponse.json({ error: "'value' (number) is required" }, { status: 400 });
  }

  const contact = body.contact?.name
    ? await findOrCreateContact(result.org.id, {
        name: body.contact.name,
        email: body.contact.email ?? null,
        phone: body.contact.phone ?? null,
        address: body.contact.address ?? null,
      })
    : null;

  const job = body.jobId
    ? await prisma.job.update({
        where: { id: body.jobId },
        data: { value: body.value, stage: "QUOTE_SENT" },
      })
    : await prisma.job.create({
        data: {
          orgId: result.org.id,
          contactId: contact?.id ?? null,
          title: body.title || `Quote for ${contact?.name ?? "customer"}`,
          value: body.value,
          notes: body.notes ?? null,
          stage: "QUOTE_SENT",
        },
      });

  await prisma.jobStageEvent.create({
    data: { jobId: job.id, stage: "QUOTE_SENT", note: "Quote issued" },
  });

  const invoice = await prisma.invoice.create({
    data: {
      orgId: result.org.id,
      jobId: job.id,
      reference: body.reference ?? "Quote",
      amount: body.value,
      status: "OUTSTANDING",
    },
  });

  return NextResponse.json({ job, invoice }, { status: 201 });
}
