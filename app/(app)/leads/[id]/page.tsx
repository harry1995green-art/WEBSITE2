import { notFound } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatGBP, formatDateShort, LEAD_STATUSES } from "@/lib/constants";
import { Card, Label, Select, SubmitButton, DangerButton } from "@/components/ui";
import { updateLeadStatus, deleteLead, convertLeadToJob } from "../actions";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getActiveOrg();
  const lead = await prisma.lead.findFirst({
    where: { id, orgId: org.id },
    include: { contact: true, job: true },
  });
  if (!lead) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{lead.title}</h1>
        <p className="text-slate-500 mt-1">Created {formatDateShort(lead.createdAt)}</p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Contact</h2>
        {lead.contact ? (
          <div className="text-sm text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900">{lead.contact.name}</div>
            {lead.contact.email ? <div>{lead.contact.email}</div> : null}
            {lead.contact.phone ? <div>{lead.contact.phone}</div> : null}
            {lead.contact.address ? <div>{lead.contact.address}</div> : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No contact linked.</p>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Enquiry details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Source</dt>
            <dd className="font-medium text-slate-900">{lead.source ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Estimated value</dt>
            <dd className="font-medium text-slate-900">{lead.value ? formatGBP(lead.value) : "—"}</dd>
          </div>
        </dl>
        {lead.notes ? (
          <div>
            <dt className="text-slate-500 text-sm">Notes</dt>
            <dd className="text-sm text-slate-700 whitespace-pre-wrap">{lead.notes}</dd>
          </div>
        ) : null}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Status</h2>
        <form action={updateLeadStatus.bind(null, lead.id)} className="flex items-end gap-3 flex-wrap">
          <div className="w-48">
            <Label>Lead status</Label>
            <Select name="status" defaultValue={lead.status}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <SubmitButton>Update</SubmitButton>
        </form>
      </Card>

      <Card className="p-6 flex items-center justify-between flex-wrap gap-3">
        {lead.job ? (
          <a
            href={`/jobs/${lead.job.id}`}
            className="inline-flex items-center gap-2 text-emerald-700 font-semibold text-sm"
          >
            View job in pipeline <ArrowRight size={16} />
          </a>
        ) : (
          <form action={convertLeadToJob.bind(null, lead.id)}>
            <SubmitButton>
              We want this job — push to pipeline <ArrowRight size={16} />
            </SubmitButton>
          </form>
        )}

        <form action={deleteLead.bind(null, lead.id)}>
          <DangerButton type="submit">
            <Trash2 size={16} /> Delete lead
          </DangerButton>
        </form>
      </Card>
    </div>
  );
}
