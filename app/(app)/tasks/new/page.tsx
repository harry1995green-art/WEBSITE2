import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { createTask } from "../actions";
import { PageHeader, Card, Label, Input, Select, SubmitButton } from "@/components/ui";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; contactId?: string }>;
}) {
  const { jobId, contactId } = await searchParams;
  const org = await getActiveOrg();
  const [jobs, contacts] = await Promise.all([
    prisma.job.findMany({ where: { orgId: org.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.contact.findMany({ where: { orgId: org.id }, orderBy: { name: "asc" }, take: 200 }),
  ]);

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="New Task" />
      <Card className="p-6">
        <form action={createTask} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input name="title" required placeholder="e.g. Order scaffolding" />
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" name="dueDate" />
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
            <Label>Related contact (optional)</Label>
            <Select name="contactId" defaultValue={contactId ?? ""}>
              <option value="">— None —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <SubmitButton>Save Task</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
