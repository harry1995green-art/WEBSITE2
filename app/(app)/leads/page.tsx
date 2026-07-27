import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatGBP, formatDateShort } from "@/lib/constants";
import { PageHeader, Card, PrimaryLink, Badge, EmptyState } from "@/components/ui";

const STATUS_COLOR = {
  NEW: "blue",
  QUALIFIED: "violet",
  CONVERTED: "emerald",
  LOST: "red",
} as const;

export default async function LeadsPage() {
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

      {leads.length === 0 ? (
        <EmptyState message="No leads yet. Add your first enquiry to get started." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
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
      )}
    </div>
  );
}
