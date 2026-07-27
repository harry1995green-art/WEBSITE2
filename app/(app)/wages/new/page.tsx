import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { createWageEntry } from "../actions";
import { PageHeader, Card, Label, Input, Select, Textarea, SubmitButton, EmptyState } from "@/components/ui";

export default async function NewWagePage() {
  const org = await getActiveOrg();
  const staff = await prisma.staffMember.findMany({
    where: { orgId: org.id, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="New Wage Entry" />
      {staff.length === 0 ? (
        <EmptyState message="Add a staff member first before logging wages." />
      ) : (
        <Card className="p-6">
          <form action={createWageEntry} className="space-y-4">
            <div>
              <Label>Staff member</Label>
              <Select name="staffId" required>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Week ending</Label>
              <Input type="date" name="weekEnding" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hours</Label>
                <Input type="number" name="hours" min="0" step="0.5" required />
              </div>
              <div>
                <Label>Amount (£)</Label>
                <Input type="number" name="amount" min="0" step="0.01" required />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" rows={3} />
            </div>
            <SubmitButton>Save Wage Entry</SubmitButton>
          </form>
        </Card>
      )}
    </div>
  );
}
