import { notFound } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { SURVEY_CONDITIONS } from "@/lib/constants";
import { Card, Label, Select, Textarea, SubmitButton } from "@/components/ui";
import { updateSection, deletePhoto, completeSurvey } from "../../actions";

export default async function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getActiveOrg();
  const survey = await prisma.survey.findFirst({
    where: { id, orgId: org.id },
    include: {
      sections: { orderBy: { order: "asc" }, include: { photos: true } },
    },
  });
  if (!survey) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{survey.propertyAddress}</h1>
        <p className="text-slate-500 mt-1">
          Surveyor: {survey.surveyorName}
          {survey.roofType ? ` · ${survey.roofType}` : ""}
        </p>
      </div>

      {survey.sections.map((section) => (
        <Card key={section.id} className="p-6 space-y-4">
          <h2 className="font-bold text-slate-900">{section.name}</h2>

          {section.photos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {section.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <Image src={photo.url} alt="" fill sizes="150px" className="object-cover" />
                  <form action={deletePhoto.bind(null, photo.id)} className="absolute top-1 right-1">
                    <button
                      type="submit"
                      className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                      aria-label="Delete photo"
                    >
                      <X size={12} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : null}

          <form action={updateSection.bind(null, section.id)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Score (1–5)</Label>
                <Select name="score" defaultValue={section.score?.toString() ?? ""}>
                  <option value="">— Not scored —</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Condition</Label>
                <Select name="condition" defaultValue={section.condition ?? ""}>
                  <option value="">— Select —</option>
                  {SURVEY_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" rows={2} defaultValue={section.notes ?? ""} />
            </div>

            <div>
              <Label>Add photos</Label>
              <input
                type="file"
                name="photos"
                accept="image/*"
                multiple
                capture="environment"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </div>

            <SubmitButton>Save section</SubmitButton>
          </form>
        </Card>
      ))}

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Finish survey</h2>
        <form action={completeSurvey.bind(null, survey.id)} className="space-y-4">
          <div>
            <Label>Summary (optional)</Label>
            <Textarea name="summary" rows={3} defaultValue={survey.summary ?? ""} />
          </div>
          <SubmitButton>Mark survey complete</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
