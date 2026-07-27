import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apiAuth";
import { PIPELINE_STAGES } from "@/lib/constants";

const VALID_STAGES = PIPELINE_STAGES.map((s) => s.value);

// Convenience endpoint for moving a job to a new pipeline stage, e.g. when
// the business owner says "yeah, we want that job" -> stage: "ACCEPTED".
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.stage) {
    return NextResponse.json({ error: "'stage' is required" }, { status: 400 });
  }
  if (!VALID_STAGES.includes(body.stage)) {
    return NextResponse.json(
      { error: `'stage' must be one of: ${VALID_STAGES.join(", ")}` },
      { status: 400 },
    );
  }

  const job = await prisma.job
    .update({ where: { id }, data: { stage: body.stage } })
    .catch(() => null);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  await prisma.jobStageEvent.create({
    data: { jobId: id, stage: body.stage, note: body.note ?? null },
  });

  return NextResponse.json({ job });
}
