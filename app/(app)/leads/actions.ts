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
  await prisma.job.updateMany({ where: { leadId }, data: { leadId: null } });
  await prisma.lead.delete({ where: { id: leadId } }).catch(() => null);
  revalidatePath("/leads");
  redirect("/leads");
}

export async function bulkDeleteLeads(formData: FormData) {
  const ids = formData.getAll("leadIds").map(String).filter(Boolean);
  if (ids.length === 0) {
    redirect("/leads");
  }

  // A lead's linked job (once converted) is real pipeline work — unlink it
  // rather than deleting it along with the lead.
  await prisma.job.updateMany({ where: { leadId: { in: ids } }, data: { leadId: null } });
  const { count } = await prisma.lead.deleteMany({ where: { id: { in: ids } } });

  revalidatePath("/leads");
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect(`/leads?bulkDeleted=${count}`);
}

export async function deleteAllLeads(formData: FormData) {
  const org = await getActiveOrg();
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== org.name) {
    redirect(`/leads?deleteAllError=${encodeURIComponent("Typed name didn't match — nothing was deleted.")}`);
  }

  await prisma.job.updateMany({ where: { orgId: org.id, leadId: { not: null } }, data: { leadId: null } });
  const { count } = await prisma.lead.deleteMany({ where: { orgId: org.id } });

  revalidatePath("/leads");
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect(`/leads?deleteAllDone=${count}`);
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
