"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/org";

export async function createTask(formData: FormData) {
  const org = await getActiveOrg();
  const dueRaw = String(formData.get("dueDate") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim() || null;
  const contactId = String(formData.get("contactId") ?? "").trim() || null;

  await prisma.task.create({
    data: {
      orgId: org.id,
      title: String(formData.get("title") ?? "").trim(),
      dueDate: dueRaw ? new Date(dueRaw) : null,
      jobId,
      contactId,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (jobId) revalidatePath(`/jobs/${jobId}`);
  redirect(jobId ? `/jobs/${jobId}` : "/tasks");
}

export async function toggleTaskStatus(taskId: string) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  await prisma.task.update({
    where: { id: taskId },
    data: { status: task.status === "DONE" ? "OPEN" : "DONE" },
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task.jobId) revalidatePath(`/jobs/${task.jobId}`);
}
