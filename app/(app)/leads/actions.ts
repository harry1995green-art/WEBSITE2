"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";
import { findOrCreateContact } from "@/lib/crm";

export async function createLead(formData: FormData) {
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

  const titleRaw = String(formData.get("title") ?? "").trim();
  const title = titleRaw || `Enquiry from ${contact?.name ?? "unknown contact"}`;
  const valueRaw = String(formData.get("value") ?? "").trim();

  const lead = await prisma.lead.create({
    data: {
      orgId: org.id,
      contactId: contact?.id ?? null,
      title,
      source: String(formData.get("source") ?? "").trim() || null,
      value: valueRaw ? Number(valueRaw) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadStatus(leadId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "NEW");
  await prisma.lead.update({ where: { id: leadId }, data: { status } });
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteLead(leadId: string) {
  await prisma.lead.delete({ where: { id: leadId } }).catch(() => null);
  revalidatePath("/leads");
  redirect("/leads");
}

export async function convertLeadToJob(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
  const existingJob = await prisma.job.findUnique({ where: { leadId } });

  if (!existingJob) {
    const job = await prisma.job.create({
      data: {
        orgId: lead.orgId,
        leadId: lead.id,
        contactId: lead.contactId,
        title: lead.title,
        value: lead.value,
        stage: "NEW_ENQUIRY",
      },
    });
    await prisma.jobStageEvent.create({ data: { jobId: job.id, stage: "NEW_ENQUIRY" } });
    await prisma.lead.update({ where: { id: lead.id }, data: { status: "CONVERTED" } });
    revalidatePath("/leads");
    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    redirect(`/jobs/${job.id}`);
  }

  redirect(`/jobs/${existingJob.id}`);
}
