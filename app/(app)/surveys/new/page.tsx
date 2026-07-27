import { prisma } from "@/lib/prisma";
import { createSurvey } from "../actions";
import { PageHeader, Card, Label, Input, SubmitButton } from "@/components/ui";

export default async function NewSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  const job = jobId
    ? await prisma.job.findUnique({ where: { id: jobId }, include: { contact: true } })
    : null;

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="New Survey" subtitle="Roof condition survey with photos & scoring" />
      <Card className="p-6">
        <form action={createSurvey} className="space-y-4">
          {jobId ? <input type="hidden" name="jobId" value={jobId} /> : null}
          <div>
            <Label>Property address</Label>
            <Input
              name="propertyAddress"
              required
              defaultValue={job?.address ?? ""}
              placeholder="12 High Street, ..."
            />
          </div>
          <div>
            <Label>Surveyor name</Label>
            <Input name="surveyorName" required />
          </div>
          <div>
            <Label>Roof type</Label>
            <Input name="roofType" placeholder="Pitched tile, flat felt, slate..." />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h2 className="font-bold text-slate-900 mb-3 text-sm">Contact (optional)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Name</Label>
                <Input name="contactName" defaultValue={job?.contact?.name ?? ""} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="contactEmail" defaultValue={job?.contact?.email ?? ""} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="contactPhone" defaultValue={job?.contact?.phone ?? ""} />
              </div>
            </div>
          </div>

          <SubmitButton>Start Survey</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
