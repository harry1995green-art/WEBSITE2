import Link from "next/link";
import { Plus, Upload, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatGBP, formatDateShort } from "@/lib/constants";
import { PageHeader, Card, PrimaryLink, Label, Input, DangerButton, Badge, EmptyState } from "@/components/ui";
import { bulkDeleteLeads, deleteAllLeads } from "./actions";
import SelectAllCheckbox from "./SelectAllCheckbox";
import DeleteSelectedButton from "./DeleteSelectedButton";

const STATUS_COLOR = {
  NEW: "blue",
  QUALIFIED: "violet",
  CONVERTED: "emerald",
  LOST: "red",
} as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ bulkDeleted?: string; deleteAllDone?: string; deleteAllError?: string }>;
}) {
  const { bulkDeleted, deleteAllDone, deleteAllError } = await searchParams;
  const org = await getActiveOrg();
  const leads = await prisma.lead.findMany({
    where: { orgId: org.id },
    include: { contact: true, job: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} total`}
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/leads/import"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <Upload size={16} /> Import CSV
            </Link>
            <PrimaryLink href="/leads/new">
              <Plus size={16} /> New Lead
            </PrimaryLink>
          </div>
        }
      />

      {bulkDeleted ? (
        <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 border border-emerald-100">
          Deleted {bulkDeleted} lead{bulkDeleted === "1" ? "" : "s"}.
        </div>
      ) : null}
      {deleteAllDone ? (
        <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 border border-emerald-100">
          Deleted all {deleteAllDone} lead{deleteAllDone === "1" ? "" : "s"} for {org.name}.
        </div>
      ) : null}
      {deleteAllError ? (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">
          {deleteAllError}
        </div>
      ) : null}

      {leads.length === 0 ? (
        <EmptyState message="No leads yet. Add your first enquiry to get started." />
      ) : (
        <form action={bulkDeleteLeads}>
          <Card className="overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium w-8">
                    <SelectAllCheckbox />
                  </th>
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Contact</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Value</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        name="leadIds"
                        value={lead.id}
                        aria-label={`Select ${lead.title}`}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-semibold text-slate-900 hover:underline">
                        {lead.title}
                      </Link>
                      {lead.job ? <span className="ml-2 text-xs text-emerald-600">→ Job</span> : null}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-slate-600">
                      {lead.contact?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge color={STATUS_COLOR[lead.status as keyof typeof STATUS_COLOR] ?? "slate"}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-slate-600">
                      {lead.value ? formatGBP(lead.value) : "—"}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-500">
                      {formatDateShort(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="mb-8">
            <DeleteSelectedButton />
          </div>
        </form>
      )}

      <Card className="p-6 border-red-200">
        <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
          <AlertTriangle size={18} />
          Danger zone
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Permanently deletes every lead for <strong>{org.name}</strong>. Contacts, and any jobs
          already converted from these leads, are kept — jobs are just unlinked. This cannot be
          undone.
        </p>
        <form action={deleteAllLeads} className="flex items-end gap-3 flex-wrap">
          <div className="w-64">
            <Label>Type &ldquo;{org.name}&rdquo; to confirm</Label>
            <Input name="confirmation" placeholder={org.name} required />
          </div>
          <DangerButton type="submit">Delete all {org.name} leads</DangerButton>
        </form>
      </Card>
    </div>
  );
}
