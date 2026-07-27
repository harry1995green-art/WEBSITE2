import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { createEvent } from "../actions";
import { PageHeader, Card, Label, Input, Select, Textarea, SubmitButton } from "@/components/ui";

export default async function NewEventPage() {
  const org = await getActiveOrg();
  const jobs = await prisma.job.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="New Calendar Event" />
      <Card className="p-6">
        <form action={createEvent} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input name="title" required placeholder="e.g. Site visit — 12 High Street" />
          </div>
          <div>
            <Label>Date &amp; time</Label>
            <Input type="datetime-local" name="date" required />
          </div>
          <div>
            <Label>Type</Label>
            <Input name="type" placeholder="Site visit, install, meeting..." />
          </div>
          <div>
            <Label>Related job (optional)</Label>
            <Select name="jobId">
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
          <SubmitButton>Save Event</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
