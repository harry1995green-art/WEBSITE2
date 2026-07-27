import { createStaffMember } from "../actions";
import { PageHeader, Card, Label, Input, SubmitButton } from "@/components/ui";

export default function NewStaffPage() {
  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="New Staff Member" />
      <Card className="p-6">
        <form action={createStaffMember} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input name="name" required />
          </div>
          <div>
            <Label>Role</Label>
            <Input name="role" placeholder="Roofer, apprentice, office..." />
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
            <Label>Hourly rate (£)</Label>
            <Input type="number" name="hourlyRate" min="0" step="0.01" />
          </div>
          <SubmitButton>Save Staff Member</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
