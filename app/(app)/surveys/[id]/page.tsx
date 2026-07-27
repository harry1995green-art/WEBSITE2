import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { formatDate } from "@/lib/constants";
import { Card, Badge } from "@/components/ui";
import PrintButton from "./PrintButton";

const CONDITION_COLOR: Record<string, "emerald" | "blue" | "amber" | "red"> = {
  Good: "emerald",
  Fair: "blue",
  Poor: "amber",
  "Needs Attention": "red",
};

export default async function SurveyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getActiveOrg();
  const survey = await prisma.survey.findFirst({
    where: { id, orgId: org.id },
    include: {
      contact: true,
      job: true,
      sections: { orderBy: { order: "asc" }, include: { photos: true } },
    },
  });
  if (!survey) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:max-w-none">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Survey Report</h1>
          {survey.status === "DRAFT" ? (
            <Link href={`/surveys/${survey.id}/edit`} className="text-sm text-slate-500 hover:text-slate-700">
              Continue editing draft →
            </Link>
          ) : null}
        </div>
        <PrintButton />
      </div>

      <Card className="p-6 print:border-0 print:shadow-none">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{survey.propertyAddress}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Surveyed {formatDate(survey.surveyDate)} by {survey.surveyorName}
            </p>
            {survey.roofType ? <p className="text-sm text-slate-500">Roof type: {survey.roofType}</p> : null}
            {survey.contact ? (
              <p className="text-sm text-slate-500">
                Contact: {survey.contact.name}
                {survey.contact.phone ? ` · ${survey.contact.phone}` : ""}
              </p>
            ) : null}
          </div>
          <div className="text-right">
            {survey.overallScore != null ? (
              <>
                <div className="text-4xl font-extrabold text-slate-900">
                  {survey.overallScore.toFixed(1)}
                  <span className="text-lg text-slate-400">/5</span>
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Overall score</div>
              </>
            ) : null}
          </div>
        </div>
        {survey.summary ? (
          <p className="mt-4 text-sm text-slate-700 whitespace-pre-wrap border-t border-slate-100 pt-4">
            {survey.summary}
          </p>
        ) : null}
      </Card>

      {survey.sections.map((section) => (
        <Card key={section.id} className="p-6 print:border-0 print:shadow-none print:break-inside-avoid">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className="font-bold text-slate-900">{section.name}</h3>
            <div className="flex items-center gap-2">
              {section.condition ? (
                <Badge color={CONDITION_COLOR[section.condition] ?? "slate"}>{section.condition}</Badge>
              ) : null}
              {section.score != null ? (
                <span className="text-sm font-semibold text-slate-700">{section.score}/5</span>
              ) : null}
            </div>
          </div>
          {section.notes ? <p className="text-sm text-slate-600 mb-3">{section.notes}</p> : null}
          {section.photos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {section.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <Image src={photo.url} alt={section.name} fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No photos</p>
          )}
        </Card>
      ))}
    </div>
  );
}
