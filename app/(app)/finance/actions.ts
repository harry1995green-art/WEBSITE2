"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";

export async function createInvoice(formData: FormData) {
  const org = await getActiveOrg();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;

  await prisma.invoice.create({
    data: {
      orgId: org.id,
      jobId,
      reference: String(formData.get("reference") ?? "").trim() || null,
      amount: Number(String(formData.get("amount") ?? "0")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/finance");
  revalidatePath("/dashboard");
  if (jobId) revalidatePath(`/jobs/${jobId}`);
  redirect(jobId ? `/jobs/${jobId}` : "/finance");
}

export async function setInvoiceStatus(invoiceId: string, status: "OUTSTANDING" | "PAID") {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  if (invoice.jobId) revalidatePath(`/jobs/${invoice.jobId}`);
}
