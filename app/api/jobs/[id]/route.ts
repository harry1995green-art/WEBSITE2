import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { contact: true, invoices: true, tasks: true, stageHistory: true },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.address !== undefined) data.address = body.address;
  if (body.value !== undefined) data.value = body.value;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.scheduledDate !== undefined) {
    data.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
  }
  if (body.stage !== undefined) data.stage = body.stage;

  const job = await prisma.job.update({ where: { id }, data }).catch(() => null);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  if (body.stage !== undefined) {
    await prisma.jobStageEvent.create({
      data: { jobId: id, stage: body.stage, note: body.note ?? null },
    });
  }

  return NextResponse.json({ job });
}
