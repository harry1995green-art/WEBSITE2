import { createJob } from "../actions";
import { PageHeader, Card, Label, Input, Textarea, SubmitButton } from "@/components/ui";

export default function NewJobPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="New Job" subtitle="Add a job straight into the pipeline" />
      <Card className="p-6">
        <form action={createJob} className="space-y-6">
          <div>
            <h2 className="font-bold text-slate-900 mb-3">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Name</Label>
                <Input name="contactName" placeholder="Jane Smith" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="contactEmail" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="contactPhone" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 mb-3">Job</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. Full re-roof" />
              </div>
              <div className="sm:col-span-2">
                <Label>Site address</Label>
                <Input name="address" />
              </div>
              <div>
                <Label>Value (£)</Label>
                <Input type="number" name="value" min="0" step="1" />
              </div>
              <div>
                <Label>Scheduled date</Label>
                <Input type="date" name="scheduledDate" />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Textarea name="notes" rows={4} />
              </div>
            </div>
          </div>

          <SubmitButton>Save Job</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
