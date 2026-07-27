import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatGBP } from "@/lib/constants";
import { PageHeader, PrimaryLink, Card, Badge, EmptyState } from "@/components/ui";
import { toggleStaffActive } from "./actions";

export default async function StaffPage() {
  const org = await getActiveOrg();
  const staff = await prisma.staffMember.findMany({
    where: { orgId: org.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Staff"
        subtitle={`${staff.length} total`}
        action={
          <PrimaryLink href="/staff/new">
            <Plus size={16} /> New Staff Member
          </PrimaryLink>
        }
      />

      {staff.length === 0 ? (
        <EmptyState message="No staff added yet." />
      ) : (
        <Card className="divide-y divide-slate-100">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <div className="font-medium text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {s.role ?? "—"}
                  {s.hourlyRate ? ` · ${formatGBP(s.hourlyRate)}/hr` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge color={s.active ? "emerald" : "slate"}>{s.active ? "Active" : "Inactive"}</Badge>
                <form action={toggleStaffActive.bind(null, s.id)}>
                  <button type="submit" className="text-xs text-slate-500 hover:text-slate-800 underline">
                    {s.active ? "Deactivate" : "Activate"}
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
