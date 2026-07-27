import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import {
  PIPELINE_STAGES,
  formatGBP,
  formatDateShort,
  stageDot,
  stageLabel,
} from "@/lib/constants";
import { Card, Label, Input, Textarea, Select, SubmitButton } from "@/components/ui";
import { updateJobStage, updateJobDetails } from "../actions";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getActiveOrg();
  const job = await prisma.job.findFirst({
    where: { id, orgId: org.id },
    include: {
      contact: true,
      tasks: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { issuedAt: "desc" } },
      surveys: { orderBy: { createdAt: "desc" } },
      stageHistory: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!job) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${stageDot(job.stage)}`} />
        <span className="text-sm font-semibold text-slate-500">{stageLabel(job.stage)}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 -mt-4">{job.title}</h1>

      {job.contact ? (
        <Card className="p-6">
          <h2 className="font-bold text-slate-900 mb-2">Contact</h2>
          <div className="text-sm text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900">{job.contact.name}</div>
            {job.contact.email ? <div>{job.contact.email}</div> : null}
            {job.contact.phone ? <div>{job.contact.phone}</div> : null}
          </div>
        </Card>
      ) : null}

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Move stage</h2>
        <form action={updateJobStage.bind(null, job.id)} className="space-y-3">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="w-56">
              <Label>Pipeline stage</Label>
              <Select name="stage" defaultValue={job.stage}>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <SubmitButton>Update stage</SubmitButton>
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Input name="note" placeholder="e.g. customer confirmed by phone" />
          </div>
        </form>
        {job.stageHistory.length > 0 ? (
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
              History
            </h3>
            <ul className="space-y-1.5 text-sm">
              {job.stageHistory.map((h) => (
                <li key={h.id} className="text-slate-600">
                  <span className="font-medium text-slate-900">{stageLabel(h.stage)}</span>{" "}
                  — {formatDateShort(h.createdAt)}
                  {h.note ? <span className="text-slate-400"> · {h.note}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Job details</h2>
        <form action={updateJobDetails.bind(null, job.id)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input name="title" defaultValue={job.title} required />
          </div>
          <div>
            <Label>Site address</Label>
            <Input name="address" defaultValue={job.address ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Value (£)</Label>
              <Input type="number" name="value" min="0" step="1" defaultValue={job.value ?? ""} />
            </div>
            <div>
              <Label>Scheduled date</Label>
              <Input
                type="date"
                name="scheduledDate"
                defaultValue={job.scheduledDate ? job.scheduledDate.toISOString().slice(0, 10) : ""}
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea name="notes" rows={4} defaultValue={job.notes ?? ""} />
          </div>
          <SubmitButton>Save details</SubmitButton>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Tasks</h2>
          <Link href={`/tasks/new?jobId=${job.id}`} className="text-sm text-slate-500 hover:text-slate-700">
            + Add task
          </Link>
        </div>
        {job.tasks.length === 0 ? (
          <p className="text-sm text-slate-400">No tasks linked.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {job.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between">
                <span className={t.status === "DONE" ? "line-through text-slate-400" : "text-slate-700"}>
                  {t.title}
                </span>
                <span className="text-xs text-slate-400">{t.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Finance</h2>
          <Link href={`/finance/new?jobId=${job.id}`} className="text-sm text-slate-500 hover:text-slate-700">
            + Add invoice
          </Link>
        </div>
        {job.invoices.length === 0 ? (
          <p className="text-sm text-slate-400">No invoices linked.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {job.invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between">
                <span className="text-slate-700">{inv.reference ?? "Invoice"}</span>
                <span className="font-semibold text-slate-900">
                  {formatGBP(inv.amount)}{" "}
                  <span className="text-xs text-slate-400 font-normal">({inv.status})</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Surveys</h2>
          <Link href={`/surveys/new?jobId=${job.id}`} className="text-sm text-slate-500 hover:text-slate-700">
            + New survey
          </Link>
        </div>
        {job.surveys.length === 0 ? (
          <p className="text-sm text-slate-400">No surveys linked.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {job.surveys.map((s) => (
              <li key={s.id}>
                <Link href={`/surveys/${s.id}`} className="text-slate-700 hover:underline">
                  {s.propertyAddress} — {formatDateShort(s.surveyDate)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
