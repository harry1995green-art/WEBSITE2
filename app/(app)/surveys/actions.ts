"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { findOrCreateContact } from "@/lib/crm";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/uploads";
import { DEFAULT_SURVEY_SECTIONS } from "@/lib/constants";

export async function createSurvey(formData: FormData) {
  const org = await getActiveOrg();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;

  const contactName = String(formData.get("contactName") ?? "").trim();
  const contact = contactName
    ? await findOrCreateContact(org.id, {
        name: contactName,
        email: String(formData.get("contactEmail") ?? ""),
        phone: String(formData.get("contactPhone") ?? ""),
      })
    : null;

  const survey = await prisma.survey.create({
    data: {
      orgId: org.id,
      jobId,
      contactId: contact?.id ?? null,
      propertyAddress: String(formData.get("propertyAddress") ?? "").trim(),
      surveyorName: String(formData.get("surveyorName") ?? "").trim(),
      roofType: String(formData.get("roofType") ?? "").trim() || null,
      sections: {
        create: DEFAULT_SURVEY_SECTIONS.map((name, order) => ({ name, order })),
      },
    },
  });

  revalidatePath("/surveys");
  redirect(`/surveys/${survey.id}/edit`);
}

export async function updateSection(sectionId: string, formData: FormData) {
  const section = await prisma.surveySection.findUniqueOrThrow({ where: { id: sectionId } });

  const scoreRaw = String(formData.get("score") ?? "").trim();

  await prisma.surveySection.update({
    where: { id: sectionId },
    data: {
      score: scoreRaw ? Number(scoreRaw) : null,
      condition: String(formData.get("condition") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    const url = await saveUploadedFile(file, `surveys/${section.surveyId}`);
    await prisma.surveyPhoto.create({
      data: { sectionId, url },
    });
  }

  revalidatePath(`/surveys/${section.surveyId}/edit`);
}

export async function deletePhoto(photoId: string) {
  const photo = await prisma.surveyPhoto.findUniqueOrThrow({
    where: { id: photoId },
    include: { section: true },
  });
  await prisma.surveyPhoto.delete({ where: { id: photoId } });
  await deleteUploadedFile(photo.url);
  revalidatePath(`/surveys/${photo.section.surveyId}/edit`);
}

export async function completeSurvey(surveyId: string, formData: FormData) {
  const survey = await prisma.survey.findUniqueOrThrow({
    where: { id: surveyId },
    include: { sections: true },
  });

  const scored = survey.sections.filter((s) => s.score != null);
  const overallScore =
    scored.length > 0
      ? scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length
      : null;

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      status: "COMPLETED",
      overallScore,
      summary: String(formData.get("summary") ?? "").trim() || null,
    },
  });

  revalidatePath("/surveys");
  redirect(`/surveys/${surveyId}`);
}
