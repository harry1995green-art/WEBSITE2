import { prisma } from "./prisma";
import { deleteUploadedFile } from "./uploads";

// Wipes all customer/pipeline data for one org: contacts, leads, jobs (and
// their stage history, invoices, calendar events, tasks), and surveys
// (including photos on disk/Blob). Staff and wages are untouched. Deletes
// children before parents so it works regardless of DB-level cascade
// config, and is scoped to a single orgId throughout.
export async function resetOrgData(orgId: string) {
  const photos = await prisma.surveyPhoto.findMany({
    where: { section: { survey: { orgId } } },
    select: { url: true },
  });
  await Promise.all(photos.map((p) => deleteUploadedFile(p.url)));

  await prisma.$transaction([
    prisma.surveyPhoto.deleteMany({ where: { section: { survey: { orgId } } } }),
    prisma.surveySection.deleteMany({ where: { survey: { orgId } } }),
    prisma.survey.deleteMany({ where: { orgId } }),
    prisma.jobStageEvent.deleteMany({ where: { job: { orgId } } }),
    prisma.invoice.deleteMany({ where: { orgId } }),
    prisma.calendarEvent.deleteMany({ where: { orgId } }),
    prisma.task.deleteMany({ where: { orgId } }),
    prisma.job.deleteMany({ where: { orgId } }),
    prisma.lead.deleteMany({ where: { orgId } }),
    prisma.contact.deleteMany({ where: { orgId } }),
  ]);
}
