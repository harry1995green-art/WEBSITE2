import Link from "next/link";
import { PageHeader, Card, PrimaryLink } from "@/components/ui";

export default async function ImportResultPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; errorCount?: string; errors?: string }>;
}) {
  const { imported = "0", errorCount = "0", errors } = await searchParams;
  const errorList = errors ? errors.split(" | ") : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Import Complete" />

      <Card className="p-6">
        <p className="text-lg">
          <span className="font-extrabold text-emerald-600">{imported}</span> lead
          {imported === "1" ? "" : "s"} imported.
        </p>
        {Number(errorCount) > 0 ? (
          <p className="text-sm text-slate-500 mt-1">
            {errorCount} row{errorCount === "1" ? "" : "s"} had a problem — see below.
          </p>
        ) : null}
      </Card>

      {errorList.length > 0 ? (
        <Card className="p-6">
          <h2 className="font-bold text-slate-900 mb-3">Skipped / errors</h2>
          <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside">
            {errorList.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="flex items-center gap-4">
        <PrimaryLink href="/leads">View Leads</PrimaryLink>
        <Link href="/leads/import" className="text-sm text-slate-500 hover:text-slate-700">
          Import more
        </Link>
      </div>
    </div>
  );
}
