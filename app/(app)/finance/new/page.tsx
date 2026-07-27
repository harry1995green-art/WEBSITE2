import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { createInvoice } from "../actions";
import { PageHeader, Card, Label, Input, Select, Textarea, SubmitButton } from "@/components/ui";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  const org = await getActiveOrg();
  const jobs = await prisma.job.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="New Invoice" />
      <Card className="p-6">
        <form action={createInvoice} className="space-y-4">
          <div>
            <Label>Reference</Label>
            <Input name="reference" placeholder="INV-0001" />
          </div>
          <div>
            <Label>Amount (£)</Label>
            <Input type="number" name="amount" min="0" step="0.01" required />
          </div>
          <div>
            <Label>Related job (optional)</Label>
            <Select name="jobId" defaultValue={jobId ?? ""}>
              <option value="">— None —</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea name="notes" rows={3} />
          </div>
          <SubmitButton>Save Invoice</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
