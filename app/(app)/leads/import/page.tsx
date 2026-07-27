import { importLeads } from "./actions";
import { PageHeader, Card, Label, Textarea, SubmitButton } from "@/components/ui";

export default async function ImportLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Import Leads"
        subtitle="Bring in a CSV export (e.g. from HubSpot) — matching contacts are updated, new ones are created"
      />

      {error ? (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">
          {error}
        </div>
      ) : null}

      <Card className="p-6 space-y-6">
        <div className="text-sm text-slate-600">
          <p className="mb-2">
            Expected columns (any order, header names are flexible):
          </p>
          <code className="block bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-700">
            Name, Email, Phone, Address, Title, Source, Estimated Value, Notes
          </code>
          <p className="mt-2 text-slate-500">
            Only <strong>Name</strong> is required — everything else is optional. Rows with no
            name are skipped and reported after import.
          </p>
        </div>

        <form action={importLeads} className="space-y-4">
          <div>
            <Label>Upload a CSV file</Label>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
          </div>

          <div className="text-center text-xs text-slate-400">— or —</div>

          <div>
            <Label>Paste CSV data</Label>
            <Textarea
              name="csvText"
              rows={10}
              placeholder={"Name,Email,Phone,Address,Title,Source,Estimated Value,Notes\nJane Smith,jane@example.com,07000000000,...,Re-roof enquiry,HubSpot,4500,..."}
              className="font-mono text-xs"
            />
          </div>

          <SubmitButton>Import Leads</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
