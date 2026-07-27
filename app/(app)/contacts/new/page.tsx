import { createContact } from "../actions";
import { PageHeader, Card, Label, Input, Textarea, SubmitButton } from "@/components/ui";

export default function NewContactPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="New Contact" />
      <Card className="p-6">
        <form action={createContact} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input name="name" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" name="email" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input name="address" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea name="notes" rows={4} />
          </div>
          <SubmitButton>Save Contact</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
