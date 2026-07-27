import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatGBP, formatDateShort } from "@/lib/constants";
import { PageHeader, PrimaryLink, Card, Badge, EmptyState } from "@/components/ui";
import StatCard from "@/components/StatCard";
import { setInvoiceStatus } from "./actions";

export default async function FinancePage() {
  const org = await getActiveOrg();
  const [invoices, outstandingAgg, paidAgg] = await Promise.all([
    prisma.invoice.findMany({
      where: { orgId: org.id },
      include: { job: true },
      orderBy: { issuedAt: "desc" },
    }),
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
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Finance"
        subtitle={`${invoices.length} invoices`}
        action={
          <PrimaryLink href="/finance/new">
            <Plus size={16} /> New Invoice
          </PrimaryLink>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Outstanding" value={formatGBP(outstandingAgg._sum.amount)} tone="warning" />
        <StatCard label="Paid This Year" value={formatGBP(paidAgg._sum.amount)} tone="success" />
      </div>

      {invoices.length === 0 ? (
        <EmptyState message="No invoices yet." />
      ) : (
        <Card className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate">
                  {inv.reference ?? inv.job?.title ?? "Invoice"}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Issued {formatDateShort(inv.issuedAt)}
                  {inv.job ? ` · ${inv.job.title}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-slate-900">{formatGBP(inv.amount)}</span>
                <Badge color={inv.status === "PAID" ? "emerald" : "amber"}>{inv.status}</Badge>
                <form
                  action={setInvoiceStatus.bind(
                    null,
                    inv.id,
                    inv.status === "PAID" ? "OUTSTANDING" : "PAID",
                  )}
                >
                  <button type="submit" className="text-xs text-slate-500 hover:text-slate-800 underline">
                    Mark {inv.status === "PAID" ? "outstanding" : "paid"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
