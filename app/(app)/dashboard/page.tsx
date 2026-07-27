import Link from "next/link";
import { Plus, Users, Briefcase, UserCircle, CheckSquare, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import {
  PIPELINE_STAGES,
  CLOSED_STAGES,
  formatGBP,
  formatDate,
  stageDot,
} from "@/lib/constants";
import StatCard from "@/components/StatCard";

export default async function DashboardPage() {
  const org = await getActiveOrg();

  const [
    totalLeads,
    activeJobs,
    totalContacts,
    openTasks,
    outstandingAgg,
    paidAgg,
    pipelineAgg,
    jobsByStage,
  ] = await Promise.all([
    prisma.lead.count({ where: { orgId: org.id } }),
    prisma.job.count({ where: { orgId: org.id, stage: { notIn: CLOSED_STAGES } } }),
    prisma.contact.count({ where: { orgId: org.id } }),
    prisma.task.count({ where: { orgId: org.id, status: "OPEN" } }),
    prisma.invoice.aggregate({
      where: { orgId: org.id, status: "OUTSTANDING" },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        orgId: org.id,
        status: "PAID",
        paidAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
      },
      _sum: { amount: true },
    }),
    prisma.job.aggregate({
      where: { orgId: org.id, stage: { notIn: CLOSED_STAGES } },
      _sum: { value: true },
    }),
    prisma.job.groupBy({
      by: ["stage"],
      where: { orgId: org.id },
      _count: { _all: true },
    }),
  ]);

  const stageCounts = new Map(jobsByStage.map((s) => [s.stage, s._count._all]));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{org.name}</h1>
          <p className="text-slate-500 mt-1">{formatDate(new Date())}</p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 transition h-fit"
        >
          <Plus size={16} /> New Lead
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Leads" value={totalLeads} icon={Users} />
        <StatCard label="Active Jobs" value={activeJobs} icon={Briefcase} />
        <StatCard label="Contacts" value={totalContacts} icon={UserCircle} />
        <StatCard label="Open Tasks" value={openTasks} icon={CheckSquare} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Outstanding"
          value={formatGBP(outstandingAgg._sum.amount)}
          tone="warning"
        />
        <StatCard
          label="Paid This Year"
          value={formatGBP(paidAgg._sum.amount)}
          tone="success"
        />
        <StatCard label="Pipeline Value" value={formatGBP(pipelineAgg._sum.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <TrendingUp size={18} />
            Job Pipeline
          </div>
          <Link href="/jobs" className="text-sm text-slate-500 hover:text-slate-700">
            View all →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((stage) => (
            <Link
              key={stage.value}
              href={`/jobs?stage=${stage.value}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200 transition px-4 py-2 text-sm text-slate-700"
            >
              <span className={`h-2 w-2 rounded-full ${stageDot(stage.value)}`} />
              {stage.label}
              <span className="font-semibold">{stageCounts.get(stage.value) ?? 0}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
