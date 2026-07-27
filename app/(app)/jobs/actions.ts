"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { findOrCreateContact } from "@/lib/crm";

export async function createJob(formData: FormData) {
  const org = await getActiveOrg();

  const contactName = String(formData.get("contactName") ?? "").trim();
  const contact = contactName
    ? await findOrCreateContact(org.id, {
        name: contactName,
        email: String(formData.get("contactEmail") ?? ""),
        phone: String(formData.get("contactPhone") ?? ""),
        address: String(formData.get("contactAddress") ?? ""),
      })
    : null;

  const valueRaw = String(formData.get("value") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduledDate") ?? "").trim();

  const job = await prisma.job.create({
    data: {
      orgId: org.id,
      contactId: contact?.id ?? null,
      title: String(formData.get("title") ?? "").trim() || "Untitled job",
      address: String(formData.get("address") ?? "").trim() || contact?.address || null,
      value: valueRaw ? Number(valueRaw) : null,
      scheduledDate: scheduledRaw ? new Date(scheduledRaw) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      stage: "NEW_ENQUIRY",
    },
  });
  await prisma.jobStageEvent.create({ data: { jobId: job.id, stage: "NEW_ENQUIRY" } });

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect(`/jobs/${job.id}`);
}

export async function updateJobStage(jobId: string, formData: FormData) {
  const stage = String(formData.get("stage") ?? "NEW_ENQUIRY");
  const note = String(formData.get("note") ?? "").trim() || null;

  await prisma.job.update({ where: { id: jobId }, data: { stage } });
  await prisma.jobStageEvent.create({ data: { jobId, stage, note } });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
}

export async function updateJobDetails(jobId: string, formData: FormData) {
  const valueRaw = String(formData.get("value") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduledDate") ?? "").trim();

  await prisma.job.update({
    where: { id: jobId },
    data: {
      title: String(formData.get("title") ?? "").trim() || "Untitled job",
      address: String(formData.get("address") ?? "").trim() || null,
      value: valueRaw ? Number(valueRaw) : null,
      scheduledDate: scheduledRaw ? new Date(scheduledRaw) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
}
