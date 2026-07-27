import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { PIPELINE_STAGES, formatGBP, stageLabel } from "@/lib/constants";
import { PageHeader, PrimaryLink, Card, EmptyState } from "@/components/ui";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage: stageFilter } = await searchParams;
  const org = await getActiveOrg();
  const jobs = await prisma.job.findMany({
    where: { orgId: org.id },
    include: { contact: true },
    orderBy: { updatedAt: "desc" },
  });

  const stagesToShow = stageFilter
    ? PIPELINE_STAGES.filter((s) => s.value === stageFilter)
    : PIPELINE_STAGES;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Jobs"
        subtitle={stageFilter ? `Filtered: ${stageLabel(stageFilter)}` : `${jobs.length} total`}
        action={
          <PrimaryLink href="/jobs/new">
            <Plus size={16} /> New Job
          </PrimaryLink>
        }
      />

      {stageFilter ? (
        <Link href="/jobs" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
          ← Clear filter
        </Link>
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {stagesToShow.map((stage) => {
          const stageJobs = jobs.filter((j) => j.stage === stage.value);
          return (
            <div key={stage.value} className="w-72 shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
                <span className="font-semibold text-slate-700 text-sm">{stage.label}</span>
                <span className="text-slate-400 text-sm">{stageJobs.length}</span>
              </div>
              <div className="space-y-3">
                {stageJobs.length === 0 ? (
                  <div className="text-xs text-slate-400 px-1">No jobs</div>
                ) : (
                  stageJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <Card className="p-4 hover:border-slate-300 transition">
                        <div className="font-semibold text-slate-900 text-sm mb-1">{job.title}</div>
                        <div className="text-xs text-slate-500 mb-2">{job.contact?.name ?? "No contact"}</div>
                        {job.value ? (
                          <div className="text-sm font-bold text-slate-900">{formatGBP(job.value)}</div>
                        ) : null}
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 ? <EmptyState message="No jobs yet." /> : null}
    </div>
  );
}
