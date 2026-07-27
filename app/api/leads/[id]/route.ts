import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiAuth";
import { LEAD_STATUSES } from "@/lib/constants";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { contact: true, job: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `'status' must be one of: ${LEAD_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }
    data.status = body.status;
  }
  if (body.value !== undefined) data.value = body.value;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.title !== undefined) data.title = body.title;

  const lead = await prisma.lead
    .update({ where: { id }, data, include: { contact: true, job: true } })
    .catch(() => null);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json({ lead });
}
