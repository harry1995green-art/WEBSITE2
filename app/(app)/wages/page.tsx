import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatGBP, formatDateShort } from "@/lib/constants";
import { PageHeader, PrimaryLink, Card, Badge, EmptyState } from "@/components/ui";
import { toggleWagePaid } from "./actions";

export default async function WagesPage() {
  const org = await getActiveOrg();
  const wages = await prisma.wageEntry.findMany({
    where: { orgId: org.id },
    include: { staff: true },
    orderBy: { weekEnding: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Wages"
        subtitle={`${wages.length} entries`}
        action={
          <PrimaryLink href="/wages/new">
            <Plus size={16} /> New Wage Entry
          </PrimaryLink>
        }
      />

      {wages.length === 0 ? (
        <EmptyState message="No wage entries yet. Add staff first, then log hours." />
      ) : (
        <Card className="divide-y divide-slate-100">
          {wages.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <div className="font-medium text-slate-900">{w.staff.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Week ending {formatDateShort(w.weekEnding)} · {w.hours}h
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{formatGBP(w.amount)}</span>
                <Badge color={w.paid ? "emerald" : "amber"}>{w.paid ? "Paid" : "Unpaid"}</Badge>
                <form action={toggleWagePaid.bind(null, w.id)}>
                  <button type="submit" className="text-xs text-slate-500 hover:text-slate-800 underline">
                    Mark {w.paid ? "unpaid" : "paid"}
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
