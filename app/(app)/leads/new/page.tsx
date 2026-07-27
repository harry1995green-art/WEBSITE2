import { createLead } from "../actions";
import { PageHeader, Card, Label, Input, Textarea, SubmitButton } from "@/components/ui";

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="New Lead" subtitle="Log a new enquiry" />
      <Card className="p-6">
        <form action={createLead} className="space-y-6">
          <div>
            <h2 className="font-bold text-slate-900 mb-3">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Name</Label>
                <Input name="contactName" required placeholder="Jane Smith" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="contactEmail" placeholder="jane@example.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="contactPhone" placeholder="07000 000000" />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Input name="contactAddress" placeholder="12 High Street, ..." />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 mb-3">Enquiry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input name="title" placeholder="e.g. Re-roof, guttering repair..." />
              </div>
              <div>
                <Label>Source</Label>
                <Input name="source" placeholder="Website, referral, Facebook..." />
              </div>
              <div>
                <Label>Estimated value (£)</Label>
                <Input type="number" name="value" min="0" step="1" placeholder="0" />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Textarea name="notes" rows={4} />
              </div>
            </div>
          </div>

          <SubmitButton>Save Lead</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
