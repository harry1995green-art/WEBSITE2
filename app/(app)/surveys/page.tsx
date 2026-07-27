import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatDateShort } from "@/lib/constants";
import { PageHeader, PrimaryLink, Card, Badge, EmptyState } from "@/components/ui";

export default async function SurveysPage() {
  const org = await getActiveOrg();
  const surveys = await prisma.survey.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Survey Reports"
        subtitle={`${surveys.length} total`}
        action={
          <PrimaryLink href="/surveys/new">
            <Plus size={16} /> New Survey
          </PrimaryLink>
        }
      />

      {surveys.length === 0 ? (
        <EmptyState message="No surveys yet." />
      ) : (
        <Card className="divide-y divide-slate-100">
          {surveys.map((s) => (
            <Link
              key={s.id}
              href={s.status === "COMPLETED" ? `/surveys/${s.id}` : `/surveys/${s.id}/edit`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
            >
              <div>
                <div className="font-medium text-slate-900">{s.propertyAddress}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {formatDateShort(s.surveyDate)} · {s.surveyorName}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {s.overallScore != null ? (
                  <span className="text-sm font-bold text-slate-900">
                    {s.overallScore.toFixed(1)}/5
                  </span>
                ) : null}
                <Badge color={s.status === "COMPLETED" ? "emerald" : "amber"}>
                  {s.status === "COMPLETED" ? "Completed" : "Draft"}
                </Badge>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
